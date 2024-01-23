import { LogicConditionState } from '~shared/types'

export const logicPage = {
  title: 'Tambahkan kondisi ke formulir Anda',
  and: 'dan',
  helperText:
    'Tampil / sembunyikan pertanyaan berdasarkan input user, atau nonaktifkan submisi untuk jawaban tidak valid.',
  helperTextCta: 'Pelajari bagaimana menggunakan kondisi',
  allowedFields: 'Jenis pertanyaan yang dibolehkan',
  addLogicBtn: 'Tambah kondisi',
  logic: 'Kondisi',
  logicInstruction:
    'Harap uji coba formulir Anda untuk memastikan kondisi berjalan dengan benar.',
  logicClause: {
    addConditionCta: 'Tambah kondisi',
    cta: 'Tambahkan',
    if: 'jika',
    is: '',
    then: 'lalu',
    show: '',
    selectQuestion: 'Pilih pertanyaan',
    selectResultType: 'Pilih aksi',
  },
  logicCondition: {
    [LogicConditionState.Equal]: 'sama dengan',
    [LogicConditionState.Lte]: 'lebih kecil atau sama dengan',
    [LogicConditionState.Gte]: 'lebih besar atau sama dengan',
    [LogicConditionState.Either]: 'salah satu',
  },
  actionTypes: {
    showFields: 'Tampilkan pertanyaan',
    disableSubmission: 'Non-aktifkan submisi',
    disabledSubmissionMessagePlaceholder:
      'Pesan yang ditunjukkan ke responden untuk menjelaskan alasan submisi nonaktif',
  },
  errors: {
    disabledSubmissionMessage:
      'Wajib masukkan pesan untuk menjelaskan alasan submisi nonaktif',
    missingLogicCriteria: 'Wajib masukkan kriteria kondisi',
    missingLogicType: 'Wajib pilih salah satu aksi kondisi',
  },
}
