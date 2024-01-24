import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { chakra, Flex, FormControl } from '@chakra-ui/react'

import { FormColorTheme } from '~shared/types/form'

import Button from '~components/Button'
import Rating from '~components/Field/Rating'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import Textarea from '~components/Textarea'

export type FeedbackFormInput = {
  rating: number
  comment?: string
  isPreview?: boolean
}

export interface FeedbackBlockProps {
  onSubmit: (input: FeedbackFormInput) => void
  colorTheme?: FormColorTheme
}

export const FeedbackBlock = ({
  onSubmit,
  colorTheme = FormColorTheme.Blue,
}: FeedbackBlockProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    control,
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<FeedbackFormInput>()

  const handleFormSubmit = handleSubmit((inputs) => onSubmit(inputs))

  const colorScheme = useMemo(() => {
    return `theme-${colorTheme}` as const
  }, [colorTheme])

  return (
    <Flex justify="center">
      <chakra.form w="100%" maxW="100%" noValidate onSubmit={handleFormSubmit}>
        <FormControl isInvalid={!!errors.rating} id="rating">
          <FormLabel isRequired color="content.strong">
            {t('features.common.feedbackSubmission.title')}
          </FormLabel>
          <Controller
            rules={{
              required: t('features.common.feedbackSubmission.ratingRequired'),
            }}
            control={control}
            name="rating"
            render={({ field }) => (
              <Rating
                isRequired
                fieldTitle="Form feedback rating"
                colorScheme={colorScheme}
                numberOfRatings={5}
                variant="star"
                {...field}
              />
            )}
          />
          <FormErrorMessage>{errors.rating?.message}</FormErrorMessage>
        </FormControl>
        <Textarea
          isReadOnly={isSubmitting}
          mt="1rem"
          {...register('comment')}
          aria-label={t(
            'features.common.feedbackSubmission.feedbackPlaceholder',
          )}
          placeholder={t(
            'features.common.feedbackSubmission.feedbackPlaceholder',
          )}
        />
        <Button
          mt="1.5rem"
          variant="outline"
          type="submit"
          colorScheme={colorScheme}
          isLoading={isSubmitting}
        >
          {t('features.common.feedbackSubmission.cta')}
        </Button>
      </chakra.form>
    </Flex>
  )
}
