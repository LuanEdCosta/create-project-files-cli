import EN_US from './EN_US.json'

export type SupportedLocales = 'en-US'
export type LocaleObject = { [key: string]: string }

export interface TranslationOptions {
  fallbackKey?: string
  locale?: SupportedLocales
  interpolation?: {
    [key: string]: string
  }
}

const AllLocales: { [key: string]: LocaleObject } = {
  'en-US': EN_US,
}

export class Locale {
  private _locale: SupportedLocales

  constructor(locale: SupportedLocales) {
    this._locale = locale
  }

  private _interpolate(
    text: string,
    interpolation: TranslationOptions['interpolation'],
  ): string {
    if (!interpolation || !Object.keys(interpolation).length) return text

    let textWithInterpolation = `${text}`
    Object.entries(interpolation).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      textWithInterpolation = textWithInterpolation.replace(regex, value)
    })

    return textWithInterpolation
  }

  public get(key: string, options: TranslationOptions) {
    const localeToUse = options.locale || this._locale
    if (!localeToUse) return key

    const text = AllLocales[localeToUse][key]
    if (text) return this._interpolate(text, options.interpolation)

    const fallbackText = AllLocales[localeToUse][options.fallbackKey || '']
    if (fallbackText) {
      return this._interpolate(fallbackText, options.interpolation)
    }

    return key
  }
}
