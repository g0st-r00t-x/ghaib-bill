import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/Components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import { Textarea } from "@/Components/ui/textarea";

// Types
type FieldOption = {
  label: string;
  value: string | number;
};

type ValidationRule = {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
};

type FieldType = 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';

type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  options?: FieldOption[];
  validation?: ValidationRule;
  defaultValue?: any;
};

type FormConfig = {
  fields: FieldConfig[];
  onSubmit: (data: any) => void;
};

type ValidationMessages = {
  [K in Exclude<keyof ValidationRule, 'message' | 'custom'>]: string;
} & {
  email: string;
  custom: string;
};

// Validation messages
const getValidationMessage = (field: FieldConfig, rule: keyof ValidationMessages, value?: any): string => {
  if (field.validation?.message) return field.validation.message;

  const messages: ValidationMessages = {
    required: `${field.label} is required`,
    min: `${field.label} must be at least ${value}`,
    max: `${field.label} must be at most ${value}`,
    minLength: `${field.label} must be at least ${value} characters`,
    maxLength: `${field.label} must be at most ${value} characters`,
    pattern: `${field.label} format is invalid`,
    email: `Please enter a valid email address`,
    custom: `${field.label} validation failed`
  };

  return messages[rule];
};

// Schema generator
const generateZodSchema = (fields: FieldConfig[]) => {
  const schemaObject: Record<string, z.ZodType<any>> = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodType<any>;

    // Type-specific base schema
    switch (field.type) {
      case 'number': {
        let schema = z.number({
          invalid_type_error: `${field.label} must be a number`
        });

        if (field.validation) {
          const { min, max, required } = field.validation;

          if (required) {
            schema = schema.min(1, {
              message: getValidationMessage(field, 'required')
            });
          }

          if (typeof min === 'number') {
            schema = schema.min(min, {
              message: getValidationMessage(field, 'min', min)
            });
          }

          if (typeof max === 'number') {
            schema = schema.max(max, {
              message: getValidationMessage(field, 'max', max)
            });
          }
        }

        fieldSchema = schema;
        break;
      }

      case 'email': {
        let schema = z.string().email(getValidationMessage(field, 'email'));

        if (field.validation) {
          const { required, minLength, maxLength, pattern } = field.validation;

          if (required) {
            schema = schema.min(1, {
              message: getValidationMessage(field, 'required')
            });
          }

          if (typeof minLength === 'number') {
            schema = schema.min(minLength, {
              message: getValidationMessage(field, 'minLength', minLength)
            });
          }

          if (typeof maxLength === 'number') {
            schema = schema.max(maxLength, {
              message: getValidationMessage(field, 'maxLength', maxLength)
            });
          }

          if (pattern) {
            schema = schema.regex(pattern, {
              message: getValidationMessage(field, 'pattern')
            });
          }
        }

        fieldSchema = schema;
        break;
      }

      case 'checkbox': {
        let schema: z.ZodType<boolean> = z.boolean();

        if (field.validation?.required) {
          schema = schema.refine(val => val === true, {
            message: getValidationMessage(field, 'required')
          });
        }

        fieldSchema = schema;
        break;
      }



      default: {
        let schema = z.string();

        if (field.validation) {
          const { required, minLength, maxLength, pattern } = field.validation;

          if (required) {
            schema = schema.min(1, {
              message: getValidationMessage(field, 'required')
            });
          }

          if (typeof minLength === 'number') {
            schema = schema.min(minLength, {
              message: getValidationMessage(field, 'minLength', minLength)
            });
          }

          if (typeof maxLength === 'number') {
            schema = schema.max(maxLength, {
              message: getValidationMessage(field, 'maxLength', maxLength)
            });
          }

          if (pattern) {
            schema = schema.regex(pattern, {
              message: getValidationMessage(field, 'pattern')
            });
          }
        }

        fieldSchema = schema;
        break;
      }
    }

    schemaObject[field.name] = field.validation?.required ? fieldSchema : fieldSchema.optional();
  });

  return z.object(schemaObject);
};

// Field renderer
const FieldRenderer = ({ field, formField }: { field: FieldConfig; formField: any }) => {
  switch (field.type) {
    case 'select':
      return (
        <Select
          onValueChange={formField.onChange}
          defaultValue={formField.value}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem
                key={option.value.toString()}
                value={option.value.toString()}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'checkbox':
      return (
        <div className="items-top flex space-x-2">
          <Checkbox id="terms1" checked={formField.value}
            onCheckedChange={formField.onChange} />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms1"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        </div>
      );
    case 'textarea':
      return (
        <Textarea
          placeholder={field.placeholder}
          {...formField}
        />
      );
    default:
      return (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          {...formField}
        />
      );
  }
};

// Form Field Component
const FormFieldWrapper = ({ field, form }: { field: FieldConfig; form: any }) => {
  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>{field.label}</FormLabel>
          <FormControl>
            <FieldRenderer field={field} formField={formField} />
          </FormControl>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Main Dynamic Form Component
export const DynamicForm = ({ fields, onSubmit }: FormConfig) => {
  const formSchema = generateZodSchema(fields);

  const defaultValues = fields.reduce<Record<string, any>>((acc, field) => ({
    ...acc,
    [field.name]: field.defaultValue ?? (field.type === 'checkbox' ? false : ''),
  }), {});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {fields.map((field) => (
          <FormFieldWrapper
            key={field.name}
            field={field}
            form={form}
          />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};