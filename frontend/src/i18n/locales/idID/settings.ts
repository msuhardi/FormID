export const settings = {
  tabs: {
    general: 'Umum',
    twilioCredentials: 'Kredensial Twilio',
    webhooks: 'Webhooks',
  },
  general: {
    title: 'Pengaturan umum',
    formStatus: {
      open: '',
      closed: 'tidak ',
      description: 'Formulir <b>{status}</b>menerima respons baru',
      ariaLabel: 'Toggle status formulir',
    },
    formLimit: {
      title: 'Batasi jumlah respons',
      inputTitle: 'Jumlah respons maksimum',
      inputDescription:
        'Formulir Anda akan ditutup secara otomatis setelah mencapai batas yang ditentukan',
      error:
        'Batas harus lebih besar dari jumlah respons yang telah diterima ({currentResponseCount})',
    },
    formCustomisation: {
      closedFormMessage: 'Atur pesan untuk formulir yang ditutup',
    },
    emailNotification: {
      label:
        'Aktifkan notifikasi email untuk masalah yang dilaporkan responden',
      description:
        'Anda akan menerima maksimum 1 email per formulir per hari apabila ada masalah yang dilaporkan',
    },
    formResponse: {
      inputLabel: 'Alamat email untuk kirim respons formulir',
      description:
        'Input minimum 2 alamat email untuk mencegah kehilang respons formulir. Pelajari [bagaimana cara untuk mencegah email terpental / gagal terkirim]({guideLink})',
      placeholder: 'Pisahkan alamat email dengan koma',
    },
  },
  twilioCredentials: {
    smsUsed: 'kuota SMS gratis terpakai',
    description:
      'Tambahkan kredensial Twilio untuk menggunakan SMS ter-verifikasi melewati kuota gratis {quota} SMS. ',
    link: 'Bagaimana mendapatkan kredensial Twilio',
    info: 'Harap test verifikasi SMS di formulir Anda untuk memastikan kredensial yang dimasukkan benar',
    saveCTA: 'Simpan kredensial',
  },
}
