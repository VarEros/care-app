"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useState } from "react"

// 🧾 Zod Schema
export const recipeSchema = z.object({
  consultationId: z.string().optional(),
  patientId: z.string().optional(),
  medication: z.string().min(1, "El medicamento es requerido"),
  dosage: z.coerce.number().min(1, "La dosis es requerida"),
  dosageFormat: z.enum(["mg", "ml", "pastilla", "gota", "tableta", "cápsula"]),
  frequency: z.string().min(1, "La frecuencia es requerida"),
  frequencyType: z.enum(["Horas", "Dias", "Semanas"]),
  until: z.date({ required_error: "La fecha límite es requerida" }),
  notes: z.string().optional(),
})

export type RecipeFormValues = z.infer<typeof recipeSchema>

interface RecipesFormProps {
  recipes: RecipeFormValues[]
  setRecipes: React.Dispatch<React.SetStateAction<RecipeFormValues[]>>
}

export function RecipesForm({ recipes, setRecipes }: RecipesFormProps) {
    const [open, setOpen] = useState(false)

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      medication: "",
      dosage: 1,
      dosageFormat: "mg",
      frequency: "",
      frequencyType: "Dias",
      until: undefined,
      notes: "",
    },
  })

  const onSubmit = (values: RecipeFormValues) => {
    setRecipes((prev) => [...prev, values])
    setOpen(false)
    form.reset()
  }

  const removeRecipe = (index: number) => {
    setRecipes((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="w-1/3 overflow-auto space-y-4">
        <Label className="text-base font-semibold">Recetas</Label>
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Agregar Receta
            </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[25vw] p-4">
            <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-2 gap-4"
            >
                <FormField
                control={form.control}
                name="medication"
                render={({ field }) => (
                    <FormItem className="col-span-2">
                    <FormLabel>Medicamento</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: Ibuprofeno" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Dosis</FormLabel>
                    <FormControl>
                        <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="dosageFormat"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Formato</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar formato" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="pastilla">Pastilla</SelectItem>
                        <SelectItem value="gota">Gota</SelectItem>
                        <SelectItem value="tableta">Tableta</SelectItem>
                        <SelectItem value="cápsula">Cápsula</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Frecuencia</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: 8" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="frequencyType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Horas">Horas</SelectItem>
                        <SelectItem value="Dias">Días</SelectItem>
                        <SelectItem value="Semanas">Semanas</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="until"
                render={({ field }) => (
                    <FormItem className="col-span-2">
                    <FormLabel>Hasta</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                                ? format(field.value, "PPP")
                                : "Seleccionar fecha"}
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(day) =>
                            day < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem className="col-span-2">
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Notas adicionales..."
                        className="resize-none"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <Button type="submit" className="col-span-2 w-full">
                Guardar Receta
                </Button>
            </form>
            </Form>
        </PopoverContent>
        </Popover>

        {recipes.length > 0 && (
        recipes.map((recipe, index) => (
            <Item key={index} variant="outline">
            <ItemContent>
                <ItemTitle className="line-clamp-1">{recipe.medication}</ItemTitle>
                <ItemDescription>
                {recipe.dosage} {recipe.dosageFormat} cada {recipe.frequency}{" "}
                {recipe.frequencyType}
                <br />
                Hasta {format(recipe.until, "PPP")}
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <Button
                size="icon"
                variant="ghost"
                onClick={() => removeRecipe(index)}
                >
                <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </ItemActions>
            </Item>
        ))
        )}
    </div>
  )
}
