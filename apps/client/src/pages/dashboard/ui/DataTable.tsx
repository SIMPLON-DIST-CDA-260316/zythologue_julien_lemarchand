import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/shared/lib/use-mobile"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Separator } from "@/shared/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs"
import { GripVerticalIcon, CircleCheckIcon, LoaderIcon, EllipsisVerticalIcon, Columns3Icon, ChevronDownIcon, PlusIcon, ChevronsLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsRightIcon, TrendingUpIcon } from "lucide-react"

// New in v9: declare the features this table uses — anything you don't
// register is tree-shaken out of the bundle.
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper<
  typeof features,
  z.infer<typeof schema>
>()

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
})

// Libellés du menu « Colonnes » (les clés du schéma restent celles du block shadcn)
const columnLabels: Record<string, string> = {
  type: "Catégorie",
  status: "Statut",
  target: "Degré",
  limit: "Note",
  reviewer: "Brasserie",
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Glisser pour réordonner</span>
    </Button>
  )
}
const columns = columnHelper.columns([
  columnHelper.display({
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  }),
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Tout sélectionner"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("header", {
    header: "Bière",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  }),
  columnHelper.accessor("type", {
    header: "Catégorie",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.type}
        </Badge>
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.status === "Publiée" ? (
          <CircleCheckIcon className="fill-green-500 dark:fill-green-400" />
        ) : (
          <LoaderIcon
          />
        )}
        {row.original.status}
      </Badge>
    ),
  }),
  columnHelper.accessor("target", {
    header: () => <div className="w-full text-right">Degré (%)</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Enregistrement de ${row.original.header}`,
            success: "Enregistré",
            error: "Erreur",
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Degré
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.target}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  }),
  columnHelper.accessor("limit", {
    header: () => <div className="w-full text-right">Note /5</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Enregistrement de ${row.original.header}`,
            success: "Enregistré",
            error: "Erreur",
          })
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Note
        </Label>
        <Input
          className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.limit}
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  }),
  columnHelper.accessor("reviewer", {
    header: "Brasserie",
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== "Choisir une brasserie"
      if (isAssigned) {
        return row.original.reviewer
      }
      return (
        <>
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Brasserie
          </Label>
          <Select
            items={[
              { label: "Brasserie de la Senne", value: "Brasserie de la Senne" },
              { label: "Cantillon", value: "Cantillon" },
              { label: "Brasserie Dupont", value: "Brasserie Dupont" },
              { label: "Brasserie Thiriez", value: "Brasserie Thiriez" },
              { label: "Brasserie Castelain", value: "Brasserie Castelain" },
              { label: "Abbaye de Rochefort", value: "Abbaye de Rochefort" },
            ]}
          >
            <SelectTrigger
              className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue placeholder="Choisir une brasserie" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                <SelectItem value="Brasserie de la Senne">Brasserie de la Senne</SelectItem>
                <SelectItem value="Cantillon">Cantillon</SelectItem>
                <SelectItem value="Brasserie Dupont">Brasserie Dupont</SelectItem>
                <SelectItem value="Brasserie Thiriez">Brasserie Thiriez</SelectItem>
                <SelectItem value="Brasserie Castelain">Brasserie Castelain</SelectItem>
                <SelectItem value="Abbaye de Rochefort">Abbaye de Rochefort</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </>
      )
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-open:bg-muted"
              size="icon"
            />
          }
        >
          <EllipsisVerticalIcon
          />
          <span className="sr-only">Ouvrir le menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Modifier</DropdownMenuItem>
          <DropdownMenuItem>Dupliquer</DropdownMenuItem>
          <DropdownMenuItem>Ajouter aux favoris</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
])
function DraggableRow({
  row,
}: {
  row: Row<typeof features, z.infer<typeof schema>>
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  )
}
export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )
  const table = useTable({
    features,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }
  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select
          defaultValue="outline"
          items={[
            { label: "Bières", value: "outline" },
            { label: "Brasseries", value: "past-performance" },
            { label: "Avis à modérer", value: "key-personnel" },
            { label: "Favoris", value: "focus-documents" },
          ]}
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="outline">Bières</SelectItem>
              <SelectItem value="past-performance">Brasseries</SelectItem>
              <SelectItem value="key-personnel">Avis à modérer</SelectItem>
              <SelectItem value="focus-documents">Favoris</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Bières</TabsTrigger>
          <TabsTrigger value="past-performance">
            Brasseries <Badge variant="secondary">6</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Avis à modérer <Badge variant="secondary">9</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Favoris</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <Columns3Icon data-icon="inline-start" />
              Colonnes
              <ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnLabels[column.id] ?? column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <PlusIcon
            />
            <span className="hidden lg:inline">Ajouter une bière</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <FlexRender header={header} />
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Aucun résultat.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
            {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Lignes par page
              </Label>
              <Select
                value={`${table.state.pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
                items={[10, 20, 30, 40, 50].map((pageSize) => ({
                  label: `${pageSize}`,
                  value: `${pageSize}`,
                }))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.state.pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.state.pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Première page</span>
                <ChevronsLeftIcon
                />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Page précédente</span>
                <ChevronLeftIcon
                />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Page suivante</span>
                <ChevronRightIcon
                />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Dernière page</span>
                <ChevronsRightIcon
                />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}
const chartData = [
  {
    month: "Janvier",
    desktop: 186,
    mobile: 80,
  },
  {
    month: "Février",
    desktop: 305,
    mobile: 200,
  },
  {
    month: "Mars",
    desktop: 237,
    mobile: 120,
  },
  {
    month: "Avril",
    desktop: 73,
    mobile: 190,
  },
  {
    month: "Mai",
    desktop: 209,
    mobile: 130,
  },
  {
    month: "Juin",
    desktop: 214,
    mobile: 140,
  },
]
const chartConfig = {
  desktop: {
    label: "Avis",
    color: "var(--primary)",
  },
  mobile: {
    label: "Favoris",
    color: "var(--primary)",
  },
} satisfies ChartConfig
function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()
  return (
    <Drawer swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground"
          />
        }
      >
        {item.header}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>
            Avis et favoris sur les 6 derniers mois
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  En hausse de 5,2 % ce mois{" "}
                  <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Évolution des avis et des ajouts en favoris pour cette bière
                  depuis le début de l'année.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Nom</Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Catégorie</Label>
                <Select
                  defaultValue={item.type}
                  items={[
                    { label: "Blonde", value: "Blonde" },
                    { label: "Blanche", value: "Blanche" },
                    { label: "Ambrée", value: "Ambrée" },
                    { label: "Brune", value: "Brune" },
                    { label: "Triple", value: "Triple" },
                    { label: "Saison", value: "Saison" },
                    { label: "Lambic", value: "Lambic" },
                    { label: "Trappiste", value: "Trappiste" },
                  ]}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Blonde">Blonde</SelectItem>
                      <SelectItem value="Blanche">Blanche</SelectItem>
                      <SelectItem value="Ambrée">Ambrée</SelectItem>
                      <SelectItem value="Brune">Brune</SelectItem>
                      <SelectItem value="Triple">Triple</SelectItem>
                      <SelectItem value="Saison">Saison</SelectItem>
                      <SelectItem value="Lambic">Lambic</SelectItem>
                      <SelectItem value="Trappiste">Trappiste</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Statut</Label>
                <Select
                  defaultValue={item.status}
                  items={[
                    { label: "Publiée", value: "Publiée" },
                    { label: "En revue", value: "En revue" },
                    { label: "Brouillon", value: "Brouillon" },
                  ]}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Publiée">Publiée</SelectItem>
                      <SelectItem value="En revue">En revue</SelectItem>
                      <SelectItem value="Brouillon">Brouillon</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Degré (%)</Label>
                <Input id="target" defaultValue={item.target} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Note moyenne</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="reviewer">Brasserie</Label>
              <Select
                defaultValue={item.reviewer}
                items={[
                  { label: "Brasserie de la Senne", value: "Brasserie de la Senne" },
                  { label: "Cantillon", value: "Cantillon" },
                  { label: "Brasserie Dupont", value: "Brasserie Dupont" },
                  { label: "Brasserie Thiriez", value: "Brasserie Thiriez" },
                  { label: "Brasserie Castelain", value: "Brasserie Castelain" },
                  { label: "Abbaye de Rochefort", value: "Abbaye de Rochefort" },
                ]}
              >
                <SelectTrigger id="reviewer" className="w-full">
                  <SelectValue placeholder="Choisir une brasserie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Brasserie de la Senne">Brasserie de la Senne</SelectItem>
                    <SelectItem value="Cantillon">Cantillon</SelectItem>
                    <SelectItem value="Brasserie Dupont">Brasserie Dupont</SelectItem>
                    <SelectItem value="Brasserie Thiriez">Brasserie Thiriez</SelectItem>
                    <SelectItem value="Brasserie Castelain">Brasserie Castelain</SelectItem>
                    <SelectItem value="Abbaye de Rochefort">Abbaye de Rochefort</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Enregistrer</Button>
          <DrawerClose render={<Button variant="outline" />}>Fermer</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
