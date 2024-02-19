export const settings = {
  tabs: {
    general: 'General',
    twilioCredentials: 'Twilio credentials',
    webhooks: 'Webhooks',
    routing: 'Routing',
  },
  routing: {
    title: 'Routing settings',
    cta: 'New route map',
  },
  general: {
    title: 'General settings',
    formStatus: {
      open: 'open',
      closed: 'closed',
      description: 'Your form is {status} to new responses',
      ariaLabel: 'Toggle form status',
    },
    formLimit: {
      title: 'Set a response limit',
      inputTitle: 'Maximum number of responses allowed',
      inputDescription:
        'Your form will automatically close once it reaches the set limit',
      error:
        'Submission limit must be greater than current submission count ({currentResponseCount})',
    },
    formCustomisation: {
      closedFormMessage: 'Set message for closed form',
    },
    emailNotification: {
      label: 'Enable email notifications for reports made by respondents',
      description:
        'You will receive a maximum of one email per form, per day if there are any issues reported.',
    },
    formResponse: {
      inputLabel: 'Emails where responses will be sent',
      description:
        'Add at least **2 recipients** to prevent loss of response. Learn more on [how to guard against email bounces]({guideLink}).',
      placeholder: 'Separate emails with a comma',
    },
  },
  twilioCredentials: {
    smsUsed: 'free SMSes used',
    description:
      'Add your Twilio credentials to pay for Verified SMSes beyond the free tier of {quota} SMSes. ',
    link: 'How to find your credentials',
    info: 'Please test SMS verification in your form to verify that your credentials work',
    saveCTA: 'Save credentials',
  },
}
