import { replaceTextPieces, escapeRegex } from '../TextUtils'

describe('TextUtils tests', () => {
  const text = 'The first episode was awesome'
  const regexChars = '\\ ^ $ * + ? . ( ) | { } [ ]'

  const escapedRegexChars =
    '\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'

  it('should replace multiple parts of a given text', () => {
    const partsToReplace = {
      first: 'second',
      episode: 'movie',
      awesome: 'very bad',
    }

    expect(replaceTextPieces(text, partsToReplace)).toBe(
      'The second movie was very bad',
    )
  })

  it('should be able to use regex reserved chars to replace text parts', () => {
    const regexCharsArray = regexChars.split(' ')
    const partsToReplace = {}

    regexCharsArray.forEach((charToEscape) => {
      partsToReplace[charToEscape] = '_'
    })

    const replacedChars = regexCharsArray.map(() => '_').join(' ')
    expect(replaceTextPieces(regexChars, partsToReplace)).toBe(replacedChars)
  })

  it('should escape all regex reserved characters', () => {
    expect(escapeRegex(regexChars)).toBe(escapedRegexChars)
  })
})
