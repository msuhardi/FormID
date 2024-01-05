import { Step } from 'react-joyride'
import parse from 'html-react-parser'

interface FeatureTourStepAttributes {
  id: string
  title: string
  content: string
}

export const FEATURE_TOUR: FeatureTourStepAttributes[] = [
  {
    id: 'feature_tour_first_step',
    title: 'Tambah pertanyaan',
    content:
      'Tambahkan pertanyaan ke formulir Anda dengan cara menarik dan menjatuhkannya (<i>drag and drop</i>).',
  },
  {
    id: 'feature_tour_second_step',
    title: 'Ubah judul & instruksi formulir',
    content:
      'Ubah logo, warna, dan <i>layout</i> formulir dan tambahkan instruksi ke formulir Anda.',
  },
  {
    id: 'feature_tour_third_step',
    title: 'Tambah kondisi',
    content:
      'Tambahkan kondisi untuk menunjukan / menyembunyikan pertanyaan berdasarkan jawaban.',
  },
  {
    id: 'feature_tour_fourth_step',
    title: 'Ubah halaman Terima Kasih',
    content:
      'Ubah pesan terima kasih dan tambahkan petunjuk selanjutnya setelah menanggapi formulir Anda.',
  },
]

export const FEATURE_STEPS: Step[] = FEATURE_TOUR.map(
  ({ id, title, content }) => {
    return {
      target: `#${id}`,
      title: title,
      content: parse(content),
      disableBeacon: true,
    }
  },
)
