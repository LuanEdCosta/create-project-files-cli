export const replaceTextPieces = (
  text: string,
  pieces: { [key: string]: string },
): string => {
  const regex = new RegExp(Object.keys(pieces).join('|'), 'g')
  return text.replace(regex, (matched) => pieces[matched])
}
