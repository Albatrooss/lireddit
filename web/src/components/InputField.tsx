import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useField } from 'formik'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control'
import { Input, InputProps } from '@chakra-ui/input'
import { Box } from '@chakra-ui/layout'
import { Textarea, TextareaProps } from '@chakra-ui/textarea'
import { ComponentWithAs } from '@chakra-ui/system'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
    TextareaHTMLAttributes<HTMLTextAreaElement> & {
        label: string
        name: string
        mt?: number
        textarea?: boolean
    }

export const InputField: React.FC<InputFieldProps> = ({
    label,
    textarea,
    mt,
    size: _,
    ...props
}) => {
    let InputOrTextarea:
        | ComponentWithAs<'input', InputProps>
        | ComponentWithAs<'textarea', TextareaProps> = Input
    if (textarea) InputOrTextarea = Textarea
    const [field, { error }] = useField(props)
    return (
        <Box mt={mt || 0}>
            <FormControl isInvalid={!!error}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <InputOrTextarea {...field} {...props} id={field.name} />
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
        </Box>
    )
}
