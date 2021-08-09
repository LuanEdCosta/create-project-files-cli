export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const replaceTextPieces = (
  text: string,
  pieces: { [key: string]: string },
): string => {
  const escapedPieces = Object.keys(pieces).map((piece) => escapeRegex(piece))
  const pattern = escapedPieces.join('|')
  const regex = new RegExp(pattern, 'g')
  return text.replace(regex, (matched) => pieces[matched])
}
