'use server'

interface ValidateAnswersParams {
  letter: string
  answers: Record<string, { categoryName: string; value: string }>
}

interface ValidationResult {
  [categoryId: string]: {
    valid: boolean
    reason: string
    points: number
  }
}

export async function validateAnswersWithAI(params: ValidateAnswersParams): Promise<ValidationResult> {
  const { letter, answers } = params

  const answersList = Object.entries(answers)
    .map(([id, { categoryName, value }]) => `- ${categoryName}: "${value}"`)
    .join('\n')

  const prompt = `Tu es un arbitre du jeu Petit Bac. La lettre de la manche est "${letter}".

Voici les réponses du joueur :
${answersList}

Pour chaque réponse, vérifie :
1. La réponse commence bien par la lettre "${letter}" (insensible à la casse)
2. La réponse est un mot/expression valide pour cette catégorie

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, sous cette forme exacte :
{
  "Prénom": {"valid": true, "reason": "Correct", "points": 2},
  "Pays": {"valid": false, "reason": "Ne commence pas par ${letter}", "points": 0}
}

Les clés doivent être exactement les noms de catégories fournis.
Si la réponse est vide, elle est invalide (0 point).
Si valide : 2 points. Si invalide : 0 point.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text ?? '{}'
    const parsed = JSON.parse(text)

    // Mapper les résultats par categoryId
    const result: ValidationResult = {}
    for (const [id, { categoryName }] of Object.entries(answers)) {
      const validation = parsed[categoryName]
      result[id] = validation ?? { valid: false, reason: 'Non vérifié', points: 0 }
    }
    return result
  } catch (e) {
    // En cas d'erreur, valider toutes les réponses non vides
    const result: ValidationResult = {}
    for (const [id, { value }] of Object.entries(answers)) {
      result[id] = value.trim()
        ? { valid: true, reason: 'Validé (fallback)', points: 2 }
        : { valid: false, reason: 'Vide', points: 0 }
    }
    return result
  }
}