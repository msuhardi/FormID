export const adminFormBuilder = {
  thankYouPage: {
    title: 'Ubah halaman Terima Kasih',
    buttonText: 'Teks tombol',
    defaultButtonText: 'Kirim respons baru',
    followUpInstruction: 'Instruksi tindak lanjut',
    redirectLink: 'Link pengalihan tombol',
    defaultRedirectLink: 'Link formulir',
  },
  builder: {
    title: 'Jenis pertanyaan',
    createField: 'Tambahkan ke formulir',
    image: 'Gambar',
    statement: 'Teks',
    section: 'Judul',
    attachment: 'Lampiran',
    checkbox: 'Kotak centang',
    date: 'Tanggal',
    decimal: 'Desimal',
    dropdown: 'Dropdown',
    countryRegion: 'Negara',
    email: 'Email',
    homeNumber: 'No. Telepon rumah',
    mobileNumber: 'No. HP',
    longText: 'Jawaban panjang',
    nric: 'NRIC/FIN',
    number: 'Angka',
    radio: 'Pilihan ganda',
    rating: 'Rating',
    shortAnswer: 'Jawaban singkat',
    table: 'Tabel',
    yesNo: 'Ya/Tidak',
    children: 'Children',
  },
  commonFieldComponents: {
    title: 'Pertanyaan',
    description: 'Deskripsi',
    required: 'Wajib diisi',
    noCharactersAllowed: 'Jumlah karakter yang dibolehkan',
    charactersAllowedPlaceholder: 'Jumlah karakter',
  },
  radio: {
    others: 'Lainnya',
    options: {
      title: 'Pilihan opsi',
      placeholder: 'Masukin satu opsi per baris',
    },
    duplicateOptionsError: 'Harap hapus opsi kembar',
  },
  checkbox: {
    selectionLimit: {
      label: 'Batas pilihan',
      description: 'Batasi total opsi yang bisa dipilih',
      minimum: 'Minimum',
      maximum: 'Maksimum',
    },
  },
  yesNo: {
    yes: 'Ya',
    no: 'Tidak',
  },
  paragraph: 'Teks',
  section: {
    heading: 'Judul',
  },
  rating: {
    numOfSteps: 'Jumlah rating',
    shape: 'Bentuk rating',
    shapes: {
      Heart: 'Hati',
      Star: 'Bintang',
    },
  },
  email: {
    otpVerification: {
      title: 'Verifikasi OTP',
      description: 'Responden harus verifikasi dengan memasukan kode OTP',
    },
    restrictEmailDomains: {
      title: 'Batasi domain email',
      inputLabel: 'Domain yang diperbolehkan',
      placeholder: '@morowaliutarakab.go.id',
    },
    emailConfirmation: {
      title: 'Konfirmasi email',
      description: 'Atur email konfirmasi ke responden',
      subject: {
        title: 'Subjek',
        placeholder: '',
      },
      senderName: {
        title: 'Nama pengirim',
        placeholder: 'Nama pengirim default adalah nama agensi Anda',
      },
      content: {
        title: 'Isi email',
        placeholder: '',
      },
      includePdfResponse: 'Sertakan ringkasan respons PDF',
    },
  },
  mobileNo: {
    otpVerification: {
      title: 'Verifikasi OTP',
      description:
        'Responden harus verifikasi dengan memasukan kode OTP. Apabila Anda sudah memiliki kredensial Twilio, silahkan uji coba fitur ini untuk memastikan kredensial yang dimasukkan benar.',
    },
    allowInternationalNumber: 'Bolehkan nomor internasional',
    smsCounts: 'SMS digunakan',
    twilioCredentials: {
      success: 'Kredensial Twilio berhasil ditambahkan',
      exceedQuota:
        'Anda telah mencapai batas tingkat gratis untuk verifikasi SMS.',
      noCredentials: 'Kredensial Twilio belum ditambahkan.',
      cta: 'Tambahkan kredensial',
    },
  },
  date: {
    dateValidation: {
      title: 'Validasi tanggal',
      NoPast: 'Larang tanggal yang sudah lewat',
      NoFuture: 'Larang tanggal yang akan datang',
      Custom: 'Rentang tanggal khusus',
      atLeastOneDateError: 'Wajib pilih tanggal awal atau/dan akhir',
      maxMinError: 'Tanggal akhir tidak boleh sebelum tanggal awal',
      validDateError: 'Masukkan tanggal yang valid',
    },
    customiseAvailableDays: {
      title: 'Batasi hari yang bisa dipilih',
      requiredError: 'Wajib pilih hari, minimum 1',
      noAvailableDaysError:
        'Hari yang dipilih tidak tersedia dalam rentang tanggal yang dibolehkan',
    },
  },
  imageAttachment: {
    title: 'Unggah gambar',
    requiredError: 'Wajib mengunggah gambar',
    fileUploaderLink: 'Pilih file',
    dragAndDrop: ' atau seret file dan lepas di sini',
    dragActive: 'Lepas file di sini',
    maxFileSize: 'Ukuran file maksimum: {readableMaxSize}',
    ariaLabelRemove: 'Klik untuk hapus file',
    error: {
      fileTooLarge:
        'File yang Anda upload melebihi ukuran yang diperbolehkan. Unggah file dengan ukuran di bawah {readableMaxSize}',
      fileInvalidType: 'File dengan ektensi *{fileExt} tidak dibolehkan',
      tooManyFiles: 'Anda hanya diperbolehkan untuk meunggah maksimum 1 file',
      zipFileInvalidType:
        'The following file {hiddenQty} extension[|s] in your zip file {hiddenQty} [is|are] not valid: {stringOfInvalidExtensions}',
      zipParsing: 'Ada masalah dengan zip file Anda',
    },
  },
  table: {
    minimumRows: 'Baris minimum',
    maximumRows: 'Baris maksimum',
    allowAddMoreRows: 'Responden bisa menambah baris',
    error: {
      minRow: 'Wajib lebih besar dari 0',
      maxRow: 'Wajib lebih besar dari 0',
      maxRowGreaterThanMin:
        'Baris maksimum wajib lebih besar dari baris minimum',
    },
    column: 'Kolom',
    ariaLabelDelete: 'Hapus kolom',
    addColumn: 'Tambah kolom',
  },
  number: {
    validation: 'Batasi angka yang boleh dimasukkan',
    minValue: 'Minimum',
    maxValue: 'Maksimum',
    maxValueGreaterThanMin: 'Maksimum wajib lebih besar dari minimum',
    fieldRestriction: {
      title: 'Batasi input jawaban',
      lengthRestriction: 'Batas panjang angka',
      Length: 'Jumlah karakter yang dibolehkan',
      Range: 'Rentang angka yang dibolehkan',
    },
    error: {
      validationType: 'Harap pilih opsi validasi angka',
      numOfCharacter: 'Harap masukkan jumlah karakter',
      min: 'Jumlah karakter minimum 1',
      max: 'Jumlah karakter maksimum 10000',
      rangeValue: 'Harap masukkan rentang angka',
      minRangeValue: 'Minimum tidak boleh 0',
      maxRangeValue: 'Maksimum tidak boleh 0',
    },
  },
  attachment: {
    info: 'Lihat [daftar lengkap]({acceptedFiletypes}) jenis file yang diijinkan. Harap baca [FAQ]({guideEmailReliability}) terkait jenis file yang tidak diperbolehkan.',
    maximumSize: 'Ukuran maksimum lampiran',
    error: {
      exceedSize:
        'Anda telah melewati batas ukuran lampiran pada formulir ini ({maxTotalSizeMb} MB)',
    },
  },
}
