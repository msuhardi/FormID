import Translation from './types'

export const idID: Translation = {
  translation: {
    features: {
      login: {
        LoginPage: {
          slogan: 'Buat formulir pemerintahan yang aman dalam beberepa menit',
        },
        components: {
          LoginForm: {
            onlyAvailableForPublicOfficers:
              'Masuk dengan .go.id atau alamat email lain yang telah di-<i>whitelist</i>',
            emailEmptyErrorMsg: 'Silahkan masukan alamat email',
            login: 'Log in',
            haveAQuestion: 'Punya pertanyaan?',
          },
        },
      },
    },
  },
}
