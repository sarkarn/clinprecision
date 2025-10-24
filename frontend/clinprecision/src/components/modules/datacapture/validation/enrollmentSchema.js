import * as yup from 'yup';

// Step 1: Demographics validation
export const demographicsSchema = yup.object({
  subjectId: yup
    .string()
    .required('Subject ID is required')
    .min(3, 'Subject ID must be at least 3 characters')
    .max(50, 'Subject ID must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9-_]+$/, 'Subject ID can only contain letters, numbers, hyphens, and underscores'),
  
  dateOfBirth: yup
    .date()
    .required('Date of Birth is required')
    .max(new Date(), 'Date of Birth cannot be in the future')
    .test('age', 'Subject must be at least 18 years old', function(value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),
  
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other'], 'Please select a valid gender'),
  
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone number must be in format (XXX) XXX-XXXX'),
});

// Step 2: Study/Site validation
export const studySiteSchema = yup.object({
  studyId: yup
    .string()
    .required('Study selection is required'),
  
  siteId: yup
    .string()
    .required('Site selection is required'),
});

// Complete enrollment validation (all steps combined)
export const completeEnrollmentSchema = yup.object({
  ...demographicsSchema.fields,
  ...studySiteSchema.fields,
});
