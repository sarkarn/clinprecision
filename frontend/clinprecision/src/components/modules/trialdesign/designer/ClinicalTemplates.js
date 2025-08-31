import React from 'react';

// Define domain-specific templates for common clinical trial forms
const ClinicalTemplates = {
  // Adverse Events template
  adverseEvent: {
    name: "Adverse Event Form",
    description: "Standard form for capturing adverse events (AEs)",
    fields: [
      {
        type: 'text',
        label: 'Adverse Event Term',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'AETERM',
          dataType: 'text',
          maxLength: 200,
          required: true,
          codingRequired: true,
          codingDictionary: 'MedDRA',
          sdtmMapping: 'AE.AETERM',
          source: 'clinician',
          description: 'Verbatim description of the adverse event as reported by the investigator'
        }
      },
      {
        type: 'date',
        label: 'AE Start Date',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'AESTDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: true,
          allowPartialDate: true,
          qualifierField: 'AESTDTC_QUAL',
          sdtmMapping: 'AE.AESTDTC',
          source: 'clinician',
          description: 'Date when the adverse event started',
          validationRules: ['Cannot be before informed consent date', 'Cannot be after study completion date']
        }
      },
      {
        type: 'date',
        label: 'AE End Date',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'AEENDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: false,
          allowPartialDate: true,
          qualifierField: 'AEENDTC_QUAL',
          sdtmMapping: 'AE.AEENDTC',
          source: 'clinician',
          description: 'Date when the adverse event resolved (leave blank if ongoing)'
        }
      },
      {
        type: 'radio',
        label: 'AE Severity',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'AESEV',
          dataType: 'categorical',
          options: [
            { value: '1', label: 'Mild', code: '1' },
            { value: '2', label: 'Moderate', code: '2' },
            { value: '3', label: 'Severe', code: '3' }
          ],
          required: true,
          sdtmMapping: 'AE.AESEV',
          source: 'clinician',
          description: 'Severity of the adverse event'
        }
      },
      {
        type: 'radio',
        label: 'Serious Event',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'AESER',
          dataType: 'categorical',
          options: [
            { value: 'Y', label: 'Yes', code: 'Y' },
            { value: 'N', label: 'No', code: 'N' }
          ],
          required: true,
          sdtmMapping: 'AE.AESER',
          source: 'clinician',
          description: 'Indicates if the adverse event is serious'
        }
      },
      {
        type: 'radio',
        label: 'Relationship to Study Drug',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'AEREL',
          dataType: 'categorical',
          options: [
            { value: 'NOT_RELATED', label: 'Not Related', code: 'NOT RELATED' },
            { value: 'UNLIKELY_RELATED', label: 'Unlikely Related', code: 'UNLIKELY RELATED' },
            { value: 'POSSIBLY_RELATED', label: 'Possibly Related', code: 'POSSIBLY RELATED' },
            { value: 'PROBABLY_RELATED', label: 'Probably Related', code: 'PROBABLY RELATED' },
            { value: 'DEFINITELY_RELATED', label: 'Definitely Related', code: 'DEFINITELY RELATED' }
          ],
          required: true,
          sdtmMapping: 'AE.AEREL',
          source: 'clinician',
          description: 'Assessment of the relationship between the adverse event and the study drug'
        }
      },
      {
        type: 'radio',
        label: 'Action Taken with Study Drug',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'AEACN',
          dataType: 'categorical',
          options: [
            { value: 'DOSE_NOT_CHANGED', label: 'Dose Not Changed', code: 'DOSE NOT CHANGED' },
            { value: 'DOSE_REDUCED', label: 'Dose Reduced', code: 'DOSE REDUCED' },
            { value: 'DRUG_INTERRUPTED', label: 'Drug Interrupted', code: 'DRUG INTERRUPTED' },
            { value: 'DRUG_WITHDRAWN', label: 'Drug Withdrawn', code: 'DRUG WITHDRAWN' },
            { value: 'NOT_APPLICABLE', label: 'Not Applicable', code: 'NOT APPLICABLE' }
          ],
          required: true,
          sdtmMapping: 'AE.AEACN',
          source: 'clinician',
          description: 'Action taken with the study drug due to the adverse event'
        }
      },
      {
        type: 'radio',
        label: 'Outcome',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'AEOUT',
          dataType: 'categorical',
          options: [
            { value: 'RECOVERED', label: 'Recovered/Resolved', code: 'RECOVERED/RESOLVED' },
            { value: 'RECOVERING', label: 'Recovering/Resolving', code: 'RECOVERING/RESOLVING' },
            { value: 'NOT_RECOVERED', label: 'Not Recovered/Not Resolved', code: 'NOT RECOVERED/NOT RESOLVED' },
            { value: 'RECOVERED_SEQUELAE', label: 'Recovered with Sequelae', code: 'RECOVERED WITH SEQUELAE' },
            { value: 'FATAL', label: 'Fatal', code: 'FATAL' },
            { value: 'UNKNOWN', label: 'Unknown', code: 'UNKNOWN' }
          ],
          required: true,
          sdtmMapping: 'AE.AEOUT',
          source: 'clinician',
          description: 'Outcome of the adverse event'
        }
      },
      {
        type: 'text',
        label: 'Additional Notes',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'AECOMM',
          dataType: 'text',
          maxLength: 2000,
          required: false,
          sdtmMapping: 'AE.AECOMM',
          source: 'clinician',
          description: 'Additional information about the adverse event'
        }
      }
    ]
  },
  
  // Concomitant Medications template
  concomitantMedication: {
    name: "Concomitant Medication Form",
    description: "Form for recording medications taken during the study",
    fields: [
      {
        type: 'text',
        label: 'Medication Name',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'CMTRT',
          dataType: 'text',
          maxLength: 200,
          required: true,
          codingRequired: true,
          codingDictionary: 'WHODrug',
          sdtmMapping: 'CM.CMTRT',
          source: 'clinician',
          description: 'Reported name of the medication'
        }
      },
      {
        type: 'date',
        label: 'Start Date',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'CMSTDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: true,
          allowPartialDate: true,
          qualifierField: 'CMSTDTC_QUAL',
          sdtmMapping: 'CM.CMSTDTC',
          source: 'clinician',
          description: 'Start date of medication use'
        }
      },
      {
        type: 'date',
        label: 'End Date',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'CMENDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: false,
          allowPartialDate: true,
          qualifierField: 'CMENDTC_QUAL',
          sdtmMapping: 'CM.CMENDTC',
          source: 'clinician',
          description: 'End date of medication use (leave blank if ongoing)'
        }
      },
      {
        type: 'text',
        label: 'Dose',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'CMDOSE',
          dataType: 'text',
          maxLength: 50,
          required: false,
          sdtmMapping: 'CM.CMDOSE',
          source: 'clinician',
          description: 'Dose of medication'
        }
      },
      {
        type: 'text',
        label: 'Dose Units',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'CMDOSU',
          dataType: 'text',
          maxLength: 20,
          required: false,
          sdtmMapping: 'CM.CMDOSU',
          source: 'clinician',
          description: 'Units for the dose'
        }
      },
      {
        type: 'radio',
        label: 'Frequency',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'CMFREQ',
          dataType: 'categorical',
          options: [
            { value: 'QD', label: 'Once daily', code: 'QD' },
            { value: 'BID', label: 'Twice daily', code: 'BID' },
            { value: 'TID', label: 'Three times daily', code: 'TID' },
            { value: 'QID', label: 'Four times daily', code: 'QID' },
            { value: 'PRN', label: 'As needed', code: 'PRN' },
            { value: 'OTHER', label: 'Other', code: 'OTHER' }
          ],
          required: false,
          sdtmMapping: 'CM.CMFREQ',
          source: 'clinician',
          description: 'Frequency of medication administration'
        }
      },
      {
        type: 'radio',
        label: 'Route',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'CMROUTE',
          dataType: 'categorical',
          options: [
            { value: 'ORAL', label: 'Oral', code: 'ORAL' },
            { value: 'INTRAVENOUS', label: 'Intravenous', code: 'INTRAVENOUS' },
            { value: 'SUBCUTANEOUS', label: 'Subcutaneous', code: 'SUBCUTANEOUS' },
            { value: 'INTRAMUSCULAR', label: 'Intramuscular', code: 'INTRAMUSCULAR' },
            { value: 'TOPICAL', label: 'Topical', code: 'TOPICAL' },
            { value: 'OTHER', label: 'Other', code: 'OTHER' }
          ],
          required: false,
          sdtmMapping: 'CM.CMROUTE',
          source: 'clinician',
          description: 'Route of administration'
        }
      },
      {
        type: 'text',
        label: 'Indication',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'CMINDIC',
          dataType: 'text',
          maxLength: 200,
          required: false,
          sdtmMapping: 'CM.CMINDIC',
          source: 'clinician',
          description: 'Indication for medication use'
        }
      }
    ]
  },
  
  // Vital Signs template
  vitalSigns: {
    name: "Vital Signs Form",
    description: "Form for recording vital signs measurements",
    fields: [
      {
        type: 'date',
        label: 'Assessment Date',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'VSDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: true,
          sdtmMapping: 'VS.VSDTC',
          source: 'clinician',
          description: 'Date when vital signs were measured',
          isBaselineFlag: false
        }
      },
      {
        type: 'number',
        label: 'Height',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'VSHEIGHT',
          dataType: 'numeric',
          format: '#.#',
          minValue: 50,
          maxValue: 250,
          units: 'cm',
          required: true,
          sdtmMapping: 'VS.VSORRES (where VSTESTCD=HEIGHT)',
          source: 'clinician',
          description: 'Subject height in centimeters'
        }
      },
      {
        type: 'number',
        label: 'Weight',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'VSWEIGHT',
          dataType: 'numeric',
          format: '#.#',
          minValue: 20,
          maxValue: 300,
          units: 'kg',
          required: true,
          sdtmMapping: 'VS.VSORRES (where VSTESTCD=WEIGHT)',
          source: 'clinician',
          description: 'Subject weight in kilograms'
        }
      },
      {
        type: 'number',
        label: 'Body Temperature',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'VSTEMP',
          dataType: 'numeric',
          format: '#.#',
          minValue: 30,
          maxValue: 45,
          units: '°C',
          required: true,
          sdtmMapping: 'VS.VSORRES (where VSTESTCD=TEMP)',
          source: 'clinician',
          description: 'Body temperature in degrees Celsius'
        }
      },
      {
        type: 'number',
        label: 'Systolic Blood Pressure',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'VSSYSBP',
          dataType: 'numeric',
          format: '#',
          minValue: 60,
          maxValue: 250,
          units: 'mmHg',
          required: true,
          sdtmMapping: 'VS.VSORRES (where VSTESTCD=SYSBP)',
          source: 'clinician',
          description: 'Systolic blood pressure in mmHg'
        }
      },
      {
        type: 'number',
        label: 'Diastolic Blood Pressure',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'VSDIABP',
          dataType: 'numeric',
          format: '#',
          minValue: 30,
          maxValue: 150,
          units: 'mmHg',
          required: true,
          sdtmMapping: 'VS.VSORRES (where VSTESTCD=DIABP)',
          source: 'clinician',
          description: 'Diastolic blood pressure in mmHg'
        }
      },
      {
        type: 'number',
        label: 'Heart Rate',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'VSHR',
          dataType: 'numeric',
          format: '#',
          minValue: 30,
          maxValue: 220,
          units: 'bpm',
          required: true,
          sdtmMapping: 'VS.VSORRES (where VSTESTCD=HR)',
          source: 'clinician',
          description: 'Heart rate in beats per minute'
        }
      },
      {
        type: 'number',
        label: 'Respiratory Rate',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'VSRESP',
          dataType: 'numeric',
          format: '#',
          minValue: 4,
          maxValue: 60,
          units: 'breaths/min',
          required: true,
          sdtmMapping: 'VS.VSORRES (where VSTESTCD=RESP)',
          source: 'clinician',
          description: 'Respiratory rate in breaths per minute'
        }
      },
      {
        type: 'radio',
        label: 'Position',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'VSPOS',
          dataType: 'categorical',
          options: [
            { value: 'SITTING', label: 'Sitting', code: 'SITTING' },
            { value: 'STANDING', label: 'Standing', code: 'STANDING' },
            { value: 'SUPINE', label: 'Supine', code: 'SUPINE' }
          ],
          required: true,
          sdtmMapping: 'VS.VSPOS',
          source: 'clinician',
          description: 'Position during vital signs measurement'
        }
      }
    ]
  },
  
  // Laboratory Results template
  laboratoryResults: {
    name: "Laboratory Results Form",
    description: "Form for recording laboratory test results",
    fields: [
      {
        type: 'date',
        label: 'Collection Date',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'LBDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: true,
          sdtmMapping: 'LB.LBDTC',
          source: 'clinician',
          description: 'Date when the specimen was collected'
        }
      },
      {
        type: 'radio',
        label: 'Specimen Type',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'LBSPEC',
          dataType: 'categorical',
          options: [
            { value: 'BLOOD', label: 'Blood', code: 'BLOOD' },
            { value: 'SERUM', label: 'Serum', code: 'SERUM' },
            { value: 'PLASMA', label: 'Plasma', code: 'PLASMA' },
            { value: 'URINE', label: 'Urine', code: 'URINE' },
            { value: 'CSF', label: 'Cerebrospinal Fluid', code: 'CSF' }
          ],
          required: true,
          sdtmMapping: 'LB.LBSPEC',
          source: 'clinician',
          description: 'Type of specimen collected'
        }
      },
      // Hematology
      {
        type: 'number',
        label: 'Hemoglobin',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'LBHGB',
          dataType: 'numeric',
          format: '#.#',
          minValue: 0,
          maxValue: 25,
          units: 'g/dL',
          required: false,
          sdtmMapping: 'LB.LBORRES (where LBTESTCD=HGB)',
          source: 'lab',
          description: 'Hemoglobin result',
          isBaselineFlag: false
        }
      },
      {
        type: 'number',
        label: 'Hematocrit',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'LBHCT',
          dataType: 'numeric',
          format: '#.#',
          minValue: 0,
          maxValue: 70,
          units: '%',
          required: false,
          sdtmMapping: 'LB.LBORRES (where LBTESTCD=HCT)',
          source: 'lab',
          description: 'Hematocrit result'
        }
      },
      {
        type: 'number',
        label: 'White Blood Cell Count',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'LBWBC',
          dataType: 'numeric',
          format: '#.##',
          minValue: 0,
          maxValue: 100,
          units: '10^9/L',
          required: false,
          sdtmMapping: 'LB.LBORRES (where LBTESTCD=WBC)',
          source: 'lab',
          description: 'White blood cell count'
        }
      },
      // Chemistry
      {
        type: 'number',
        label: 'Glucose',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'LBGLUC',
          dataType: 'numeric',
          format: '#.#',
          minValue: 0,
          maxValue: 500,
          units: 'mg/dL',
          required: false,
          sdtmMapping: 'LB.LBORRES (where LBTESTCD=GLUC)',
          source: 'lab',
          description: 'Blood glucose level'
        }
      },
      {
        type: 'number',
        label: 'Creatinine',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'LBCREAT',
          dataType: 'numeric',
          format: '#.##',
          minValue: 0,
          maxValue: 20,
          units: 'mg/dL',
          required: false,
          sdtmMapping: 'LB.LBORRES (where LBTESTCD=CREAT)',
          source: 'lab',
          description: 'Blood creatinine level'
        }
      },
      {
        type: 'number',
        label: 'ALT',
        width: 'half',
        widthPercent: 33,
        metadata: {
          variableName: 'LBALT',
          dataType: 'numeric',
          format: '#.#',
          minValue: 0,
          maxValue: 5000,
          units: 'U/L',
          required: false,
          sdtmMapping: 'LB.LBORRES (where LBTESTCD=ALT)',
          source: 'lab',
          description: 'Alanine aminotransferase level'
        }
      },
      {
        type: 'radio',
        label: 'Clinically Significant',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'LBCLSIG',
          dataType: 'categorical',
          options: [
            { value: 'Y', label: 'Yes', code: 'Y' },
            { value: 'N', label: 'No', code: 'N' }
          ],
          required: true,
          sdtmMapping: 'LB.LBCLSIG',
          source: 'clinician',
          description: 'Indicates if any abnormal results are clinically significant'
        }
      }
    ]
  },
  
  // Demographics template
  demographics: {
    name: "Demographics Form",
    description: "Subject demographic information",
    fields: [
      {
        type: 'date',
        label: 'Date of Birth',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'BRTHDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: true,
          allowPartialDate: true,
          qualifierField: 'BRTHDTC_QUAL',
          sdtmMapping: 'DM.BRTHDTC',
          source: 'clinician',
          description: 'Subject date of birth'
        }
      },
      {
        type: 'radio',
        label: 'Sex',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'SEX',
          dataType: 'categorical',
          options: [
            { value: 'M', label: 'Male', code: 'M' },
            { value: 'F', label: 'Female', code: 'F' },
            { value: 'U', label: 'Unknown', code: 'U' }
          ],
          required: true,
          sdtmMapping: 'DM.SEX',
          source: 'clinician',
          description: 'Sex at birth'
        }
      },
      {
        type: 'radio',
        label: 'Race',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'RACE',
          dataType: 'categorical',
          options: [
            { value: 'WHITE', label: 'White', code: 'WHITE' },
            { value: 'BLACK', label: 'Black or African American', code: 'BLACK OR AFRICAN AMERICAN' },
            { value: 'ASIAN', label: 'Asian', code: 'ASIAN' },
            { value: 'NATIVE_HAWAIIAN', label: 'Native Hawaiian or Pacific Islander', code: 'NATIVE HAWAIIAN OR OTHER PACIFIC ISLANDER' },
            { value: 'AMERICAN_INDIAN', label: 'American Indian or Alaska Native', code: 'AMERICAN INDIAN OR ALASKA NATIVE' },
            { value: 'OTHER', label: 'Other', code: 'OTHER' },
            { value: 'UNKNOWN', label: 'Unknown', code: 'UNKNOWN' },
            { value: 'NOT_REPORTED', label: 'Not Reported', code: 'NOT REPORTED' }
          ],
          required: true,
          sdtmMapping: 'DM.RACE',
          source: 'clinician',
          description: 'Race of the subject'
        }
      },
      {
        type: 'radio',
        label: 'Ethnicity',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'ETHNIC',
          dataType: 'categorical',
          options: [
            { value: 'HISPANIC', label: 'Hispanic or Latino', code: 'HISPANIC OR LATINO' },
            { value: 'NOT_HISPANIC', label: 'Not Hispanic or Latino', code: 'NOT HISPANIC OR LATINO' },
            { value: 'UNKNOWN', label: 'Unknown', code: 'UNKNOWN' },
            { value: 'NOT_REPORTED', label: 'Not Reported', code: 'NOT REPORTED' }
          ],
          required: true,
          sdtmMapping: 'DM.ETHNIC',
          source: 'clinician',
          description: 'Ethnicity of the subject'
        }
      }
    ]
  },
  
  // Medical History template
  medicalHistory: {
    name: "Medical History Form",
    description: "Form for recording subject medical history",
    fields: [
      {
        type: 'text',
        label: 'Medical Condition',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'MHTERM',
          dataType: 'text',
          maxLength: 200,
          required: true,
          codingRequired: true,
          codingDictionary: 'MedDRA',
          sdtmMapping: 'MH.MHTERM',
          source: 'clinician',
          description: 'Reported term for the medical condition'
        }
      },
      {
        type: 'date',
        label: 'Start Date',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'MHSTDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: false,
          allowPartialDate: true,
          qualifierField: 'MHSTDTC_QUAL',
          sdtmMapping: 'MH.MHSTDTC',
          source: 'clinician',
          description: 'Start date of medical condition'
        }
      },
      {
        type: 'date',
        label: 'End Date',
        width: 'half',
        widthPercent: 50,
        metadata: {
          variableName: 'MHENDTC',
          dataType: 'date',
          format: 'YYYY-MM-DD',
          required: false,
          allowPartialDate: true,
          qualifierField: 'MHENDTC_QUAL',
          sdtmMapping: 'MH.MHENDTC',
          source: 'clinician',
          description: 'End date of medical condition (leave blank if ongoing)'
        }
      },
      {
        type: 'radio',
        label: 'Current Status',
        width: 'full',
        widthPercent: 100,
        metadata: {
          variableName: 'MHONGO',
          dataType: 'categorical',
          options: [
            { value: 'Y', label: 'Ongoing', code: 'Y' },
            { value: 'N', label: 'Resolved', code: 'N' }
          ],
          required: true,
          sdtmMapping: 'MH.MHONGO',
          source: 'clinician',
          description: 'Whether the condition is ongoing'
        }
      }
    ]
  }
};

export default ClinicalTemplates;