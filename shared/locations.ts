export const COUNTRIES = [
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', cities: ['Managua', 'León', 'Masaya', 'Matagalpa', 'Chinandega', 'Estelí', 'Granada', 'Jinotega', 'Bluefields', 'Puerto Cabezas', 'Juigalpa', 'Boaco', 'Rivas', 'Somoto', 'Ocotal', 'San Carlos'] },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', cities: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Liberia', 'Puntarenas', 'Limón'] },
  { code: 'HN', name: 'Honduras', dialCode: '+504', cities: ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Choloma', 'Comayagua', 'Copán Ruinas'] },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', cities: ['San Salvador', 'Santa Ana', 'San Miguel', 'Santa Tecla', 'Sonsonate', 'Ahuachapán'] },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', cities: ['Ciudad de Guatemala', 'Antigua Guatemala', 'Quetzaltenango', 'Escuintla', 'Cobán', 'Huehuetenango'] },
  { code: 'US', name: 'United States', dialCode: '+1', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco', 'Denver', 'Other'] },
  { code: 'CA', name: 'Canada', dialCode: '+1', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa', 'Other'] },
  { code: 'MX', name: 'México', dialCode: '+52', cities: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Mérida', 'Tijuana'] },
  { code: 'OTHER', name: 'Other', dialCode: '+', cities: ['Other'] },
] as const

export type CountryCode = typeof COUNTRIES[number]['code']

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && COUNTRIES.some((country) => country.code === value)
}

export function isCityForCountry(countryCode: CountryCode, city: unknown): city is string {
  return typeof city === 'string' && COUNTRIES.find((country) => country.code === countryCode)?.cities.includes(city as never) === true
}
