-- Fix form_definitions to convert old-format options to new format
-- This updates fields that have options stored as strings to the new {value, label} format

UPDATE form_definitions
SET fields = JSON_ARRAY(
    -- General Appearance
    JSON_OBJECT(
        'id', 'exam_date',
        'type', 'datetime',
        'label', 'Examination Date/Time',
        'section', 'general',
        'helpText', 'Date and time when physical examination was performed',
        'required', true
    ),
    JSON_OBJECT(
        'id', 'general_appearance',
        'type', 'select',
        'label', 'General Appearance',
        'section', 'general',
        'helpText', 'Overall general appearance and level of distress',
        'required', true,
        'metadata', JSON_OBJECT(
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 'normal', 'label', 'Normal - Well-appearing'),
                JSON_OBJECT('value', 'mild_distress', 'label', 'Mild Distress'),
                JSON_OBJECT('value', 'moderate_distress', 'label', 'Moderate Distress'),
                JSON_OBJECT('value', 'severe_distress', 'label', 'Severe Distress'),
                JSON_OBJECT('value', 'chronic_illness', 'label', 'Chronically Ill Appearing')
            )
        )
    ),
    -- HEENT
    JSON_OBJECT(
        'id', 'heent',
        'type', 'select',
        'label', 'HEENT (Head, Eyes, Ears, Nose, Throat)',
        'section', 'systems',
        'helpText', 'Head, eyes, ears, nose, and throat examination findings',
        'required', true,
        'metadata', JSON_OBJECT(
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 'normal', 'label', 'Normal'),
                JSON_OBJECT('value', 'abnormal', 'label', 'Abnormal - See Comments'),
                JSON_OBJECT('value', 'not_examined', 'label', 'Not Examined')
            )
        )
    ),
    JSON_OBJECT(
        'id', 'heent_comments',
        'type', 'textarea',
        'label', 'HEENT Comments',
        'section', 'systems',
        'helpText', 'Describe abnormal HEENT findings',
        'required', false,
        'rows', 2,
        'maxLength', 500,
        'dependsOn', JSON_OBJECT('field', 'heent', 'value', 'abnormal')
    ),
    -- Cardiovascular
    JSON_OBJECT(
        'id', 'cardiovascular',
        'type', 'select',
        'label', 'Cardiovascular',
        'section', 'systems',
        'helpText', 'Cardiovascular system examination findings',
        'required', true,
        'metadata', JSON_OBJECT(
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 'normal', 'label', 'Normal'),
                JSON_OBJECT('value', 'abnormal', 'label', 'Abnormal - See Comments'),
                JSON_OBJECT('value', 'not_examined', 'label', 'Not Examined')
            )
        )
    ),
    JSON_OBJECT(
        'id', 'cardiovascular_comments',
        'type', 'textarea',
        'label', 'Cardiovascular Comments',
        'section', 'systems',
        'helpText', 'Describe abnormal cardiovascular findings',
        'required', false,
        'rows', 2,
        'maxLength', 500,
        'dependsOn', JSON_OBJECT('field', 'cardiovascular', 'value', 'abnormal')
    ),
    -- Respiratory
    JSON_OBJECT(
        'id', 'respiratory',
        'type', 'select',
        'label', 'Respiratory',
        'section', 'systems',
        'helpText', 'Respiratory system examination findings',
        'required', true,
        'metadata', JSON_OBJECT(
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 'normal', 'label', 'Normal'),
                JSON_OBJECT('value', 'abnormal', 'label', 'Abnormal - See Comments'),
                JSON_OBJECT('value', 'not_examined', 'label', 'Not Examined')
            )
        )
    ),
    JSON_OBJECT(
        'id', 'respiratory_comments',
        'type', 'textarea',
        'label', 'Respiratory Comments',
        'section', 'systems',
        'helpText', 'Describe abnormal respiratory findings',
        'required', false,
        'rows', 2,
        'maxLength', 500,
        'dependsOn', JSON_OBJECT('field', 'respiratory', 'value', 'abnormal')
    ),
    -- Abdomen
    JSON_OBJECT(
        'id', 'abdomen',
        'type', 'select',
        'label', 'Abdomen',
        'section', 'systems',
        'helpText', 'Abdominal examination findings',
        'required', true,
        'metadata', JSON_OBJECT(
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 'normal', 'label', 'Normal'),
                JSON_OBJECT('value', 'abnormal', 'label', 'Abnormal - See Comments'),
                JSON_OBJECT('value', 'not_examined', 'label', 'Not Examined')
            )
        )
    ),
    JSON_OBJECT(
        'id', 'abdomen_comments',
        'type', 'textarea',
        'label', 'Abdomen Comments',
        'section', 'systems',
        'helpText', 'Describe abnormal abdominal findings',
        'required', false,
        'rows', 2,
        'maxLength', 500,
        'dependsOn', JSON_OBJECT('field', 'abdomen', 'value', 'abnormal')
    ),
    -- Neurological
    JSON_OBJECT(
        'id', 'neurological',
        'type', 'select',
        'label', 'Neurological',
        'section', 'systems',
        'helpText', 'Neurological system examination findings',
        'required', true,
        'metadata', JSON_OBJECT(
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 'normal', 'label', 'Normal'),
                JSON_OBJECT('value', 'abnormal', 'label', 'Abnormal - See Comments'),
                JSON_OBJECT('value', 'not_examined', 'label', 'Not Examined')
            )
        )
    ),
    JSON_OBJECT(
        'id', 'neurological_comments',
        'type', 'textarea',
        'label', 'Neurological Comments',
        'section', 'systems',
        'helpText', 'Describe abnormal neurological findings',
        'required', false,
        'rows', 2,
        'maxLength', 500,
        'dependsOn', JSON_OBJECT('field', 'neurological', 'value', 'abnormal')
    ),
    -- Extremities
    JSON_OBJECT(
        'id', 'extremities',
        'type', 'select',
        'label', 'Extremities',
        'section', 'systems',
        'helpText', 'Extremities examination findings',
        'required', true,
        'metadata', JSON_OBJECT(
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 'normal', 'label', 'Normal'),
                JSON_OBJECT('value', 'abnormal', 'label', 'Abnormal - See Comments'),
                JSON_OBJECT('value', 'not_examined', 'label', 'Not Examined')
            )
        )
    ),
    JSON_OBJECT(
        'id', 'extremities_comments',
        'type', 'textarea',
        'label', 'Extremities Comments',
        'section', 'systems',
        'helpText', 'Describe abnormal extremities findings',
        'required', false,
        'rows', 2,
        'maxLength', 500,
        'dependsOn', JSON_OBJECT('field', 'extremities', 'value', 'abnormal')
    ),
    -- Skin
    JSON_OBJECT(
        'id', 'skin',
        'type', 'select',
        'label', 'Skin',
        'section', 'systems',
        'helpText', 'Skin and integumentary system findings',
        'required', true,
        'metadata', JSON_OBJECT(
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 'normal', 'label', 'Normal'),
                JSON_OBJECT('value', 'abnormal', 'label', 'Abnormal - See Comments'),
                JSON_OBJECT('value', 'not_examined', 'label', 'Not Examined')
            )
        )
    ),
    JSON_OBJECT(
        'id', 'skin_comments',
        'type', 'textarea',
        'label', 'Skin Comments',
        'section', 'systems',
        'helpText', 'Describe abnormal skin findings',
        'required', false,
        'rows', 2,
        'maxLength', 500,
        'dependsOn', JSON_OBJECT('field', 'skin', 'value', 'abnormal')
    ),
    -- Overall Assessment
    JSON_OBJECT(
        'id', 'overall_assessment',
        'type', 'textarea',
        'label', 'Overall Clinical Assessment',
        'section', 'assessment',
        'helpText', 'Summary of overall physical examination findings and clinical impressions',
        'required', false,
        'rows', 3,
        'maxLength', 1000
    )
)
WHERE id = 9;

-- Verify the update
SELECT 
    id,
    name,
    JSON_EXTRACT(fields, '$[1].metadata.options[0]') as first_option_sample
FROM form_definitions
WHERE id = 9;
