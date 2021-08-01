import { replaceTextPieces } from '../TextUtils'

describe('TextUtils tests', () => {
  const text = 'The first episode was awesome'

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
})
