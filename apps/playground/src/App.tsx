import { AnimatePresence, Reveal, type RevealPreset } from "@quickadui/animation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  type BadgeProps,
  Button,
  type ButtonProps,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  IconButton,
  type IconButtonProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Typography,
} from "@quickadui/core";
import {
  getPaginationRange,
  PAGINATION_ELLIPSIS,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  type TimelineDotProps,
  TimelineItem,
  TimelineSeparator,
  TreeView,
  TreeViewItem,
} from "@quickadui/data";
import {
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  useForm,
  zodResolver,
} from "@quickadui/forms";
import { useDisclosure } from "@quickadui/hooks";
import { CalendarIcon, SearchIcon, SettingsIcon, TrashIcon, UserIcon } from "@quickadui/icons";
import { Container, Flex, Grid, Section as LayoutSection, Stack } from "@quickadui/layout";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalTitle,
  ModalTrigger,
  toast,
  Toaster,
} from "@quickadui/overlays";
import { useTheme, type ThemeMode } from "@quickadui/theme";
import { useState, type ComponentType, type ReactNode } from "react";
import { z } from "zod";

const BUTTON_VARIANTS = ["solid", "soft", "outline", "ghost", "destructive"] as const satisfies readonly NonNullable<ButtonProps["variant"]>[];
const BUTTON_SIZES = ["sm", "md", "lg"] as const satisfies readonly NonNullable<ButtonProps["size"]>[];
const BADGE_VARIANTS = ["solid", "soft", "outline", "success", "warning", "danger"] as const satisfies readonly NonNullable<BadgeProps["variant"]>[];
const THEME_MODES = ["light", "dark", "system"] as const satisfies readonly ThemeMode[];
const ICONS = [
  { name: "SearchIcon", Icon: SearchIcon },
  { name: "UserIcon", Icon: UserIcon },
  { name: "SettingsIcon", Icon: SettingsIcon },
  { name: "CalendarIcon", Icon: CalendarIcon },
  { name: "TrashIcon", Icon: TrashIcon },
] as const satisfies readonly { name: string; Icon: ComponentType<{ size?: number; className?: string }> }[];

/** IconButton has no "destructive" variant — Button's extra fifth variant falls back to "ghost" here. */
function toIconButtonVariant(variant: NonNullable<ButtonProps["variant"]>): NonNullable<IconButtonProps["variant"]> {
  return variant === "destructive" ? "ghost" : variant;
}

const signupSchema = z.object({
  name: z.string().min(2, "Enter at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  role: z.enum(["member", "admin"]),
  plan: z.enum(["free", "pro"]),
  bio: z.string().optional(),
  newsletter: z.boolean(),
  terms: z.boolean().refine((accepted) => accepted === true, "You must accept the terms to continue."),
});

/**
 * Derived from the schema, not hand-written — an earlier version of this
 * file hand-wrote this interface instead (to work around what looked
 * like a local `zod` stub limitation) and it broke the real `pnpm build`
 * two ways: `bio?: string` isn't the same type as `bio?: string |
 * undefined` under `exactOptionalPropertyTypes`, and `zodResolver`'s real
 * generic infers its own field-values type from the schema, which a
 * separately hand-written (even if structurally identical) interface
 * doesn't structurally match. `z.infer` is the fix, not a workaround —
 * see the Projects status doc for the full story.
 */
type SignupFormValues = z.infer<typeof signupSchema>;

/** Real react-hook-form + Zod validation, wired to real @quickadui/forms field components — see its README for what each Form* part does. */
function SignupForm() {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", role: "member", plan: "free", bio: "", newsletter: true, terms: false },
  });

  return (
    <Form {...form}>
      <form
        className="max-w-md"
        onSubmit={form.handleSubmit((values) => {
          toast({ title: "Account created", description: `Welcome, ${values.name}.`, variant: "success" });
          form.reset();
        })}
      >
        <Stack gap="md">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Ada Lovelace" state={fieldState.error ? "error" : "default"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ada@example.com" state={fieldState.error ? "error" : "default"} {...field} />
                </FormControl>
                <FormDescription>We&apos;ll never share your email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                    <Flex align="center" gap="xs">
                      <RadioGroupItem value="free" id="plan-free" />
                      <Label htmlFor="plan-free">Free</Label>
                    </Flex>
                    <Flex align="center" gap="xs">
                      <RadioGroupItem value="pro" id="plan-pro" />
                      <Label htmlFor="plan-pro">Pro</Label>
                    </Flex>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Optional — a couple of sentences about you." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newsletter"
            render={({ field }) => (
              <FormItem>
                <Flex align="center" gap="sm">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!text-neutral-12">Subscribe to the newsletter</FormLabel>
                </Flex>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <Flex align="center" gap="sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!text-neutral-12">I accept the terms</FormLabel>
                </Flex>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Create account</Button>
        </Stack>
      </form>
    </Form>
  );
}

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <Flex align="center" gap="sm">
      <span className="text-sm text-neutral-11">
        {theme} &rarr; {resolvedTheme}
      </span>
      {THEME_MODES.map((mode) => (
        <Button key={mode} size="sm" variant={theme === mode ? "solid" : "outline"} onClick={() => setTheme(mode)}>
          {mode}
        </Button>
      ))}
    </Flex>
  );
}

/** A page-local demo wrapper (title + content) — not to be confused with `@quickadui/layout`'s `Section`, imported above as `LayoutSection` and used for the page's own outer vertical rhythm. */
function DemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="md" as="section">
      <Typography variant="h3">{title}</Typography>
      {children}
    </Stack>
  );
}

interface Invoice {
  id: string;
  status: "paid" | "pending" | "unpaid";
  method: string;
  amount: string;
}

const INVOICES = [
  { id: "INV001", status: "paid", method: "Credit Card", amount: "$250.00" },
  { id: "INV002", status: "pending", method: "PayPal", amount: "$150.00" },
  { id: "INV003", status: "unpaid", method: "Bank Transfer", amount: "$350.00" },
  { id: "INV004", status: "paid", method: "Credit Card", amount: "$450.00" },
] as const satisfies readonly Invoice[];

/** `PaginationDemo` owns its own page state — `getPaginationRange` is the pure part (see @quickadui/data's README), the click handlers below are this app's own wiring, same as its own usage example. */
function PaginationDemo() {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
        </PaginationItem>
        {getPaginationRange(page, totalPages).map((item, index) =>
          item === PAGINATION_ELLIPSIS ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink isActive={item === page} onClick={() => setPage(item)}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/** `TableRow`'s `selected` prop drives real state here — clicking a row toggles it, same pattern as `DropdownMenuCheckboxItem`'s `starred` state above. */
function TableDemo() {
  const [selectedId, setSelectedId] = useState<string | null>("INV002");

  return (
    <Stack gap="md">
      <Table>
        <TableCaption>A list of recent invoices — click a row to select it.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {INVOICES.map((invoice) => (
            <TableRow
              key={invoice.id}
              selected={selectedId === invoice.id}
              className="cursor-pointer"
              onClick={() => setSelectedId(invoice.id)}
            >
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell className="capitalize">{invoice.status}</TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell  className="text-right">{invoice.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationDemo />
    </Stack>
  );
}

const STEPPER_STEPS = ["Cart", "Shipping", "Payment", "Confirm"] as const;

/**
 * `StepperSeparator` is rendered as a direct sibling of `StepperItem`
 * here, interleaved via `flatMap` — not nested inside it — exactly the
 * shape `@quickadui/data`'s own README usage example uses, and required
 * by `StepperSeparator`'s own design (see that package's README for why
 * it can't be a descendant instead).
 */
function StepperDemo() {
  const [value, setValue] = useState(1);
  const lastStep = STEPPER_STEPS.length - 1;

  return (
    <Stack gap="md">
      <Stepper value={value}>
        {STEPPER_STEPS.flatMap((label, index) => {
          const item = (
            <StepperItem key={label} step={index}>
              <StepperIndicator>{index + 1}</StepperIndicator>
              <StepperTitle>{label}</StepperTitle>
            </StepperItem>
          );
          return index === lastStep ? [item] : [item, <StepperSeparator key={`${label}-separator`} step={index} />];
        })}
      </Stepper>
      <Flex gap="sm">
        <Button variant="outline" size="sm" disabled={value === 0} onClick={() => setValue((v) => Math.max(0, v - 1))}>
          Back
        </Button>
        <Button size="sm" disabled={value === lastStep} onClick={() => setValue((v) => Math.min(lastStep, v + 1))}>
          Next
        </Button>
      </Flex>
    </Stack>
  );
}

const ACTIVITIES = [
  { id: "1", title: "Order placed", description: "Your order has been placed.", variant: "success" },
  { id: "2", title: "Payment received", description: "We've received your payment.", variant: "success" },
  { id: "3", title: "Processing", description: "Your order is being prepared.", variant: "accent" },
  { id: "4", title: "Delivery delayed", description: "Running a bit behind schedule.", variant: "warning" },
] as const satisfies readonly { id: string; title: string; description: string; variant: NonNullable<TimelineDotProps["variant"]> }[];

function TimelineDemo() {
  return (
    <Timeline>
      {ACTIVITIES.map((activity, index) => (
        <TimelineItem key={activity.id}>
          <TimelineSeparator>
            <TimelineDot variant={activity.variant} />
            {index < ACTIVITIES.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="small" className="font-medium text-neutral-12">
              {activity.title}
            </Typography>
            <Typography variant="muted">{activity.description}</Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

/** Controlled `selectedId`, uncontrolled `expandedIds` (via `defaultExpandedIds`) — `@quickadui/data`'s README documents both modes; this demo mixes them on purpose to show they compose. */
function TreeViewDemo() {
  const [selectedId, setSelectedId] = useState<string | undefined>("src/App.tsx");

  return (
    <TreeView defaultExpandedIds={["src", "src/components"]} selectedId={selectedId} onSelect={setSelectedId}>
      <TreeViewItem nodeId="src" label="src">
        <TreeViewItem nodeId="src/components" label="components">
          <TreeViewItem nodeId="src/components/Button.tsx" label="Button.tsx" />
          <TreeViewItem nodeId="src/components/Card.tsx" label="Card.tsx" />
        </TreeViewItem>
        <TreeViewItem nodeId="src/App.tsx" label="App.tsx" />
        <TreeViewItem nodeId="src/main.tsx" label="main.tsx" />
      </TreeViewItem>
      <TreeViewItem nodeId="package.json" label="package.json" />
      <TreeViewItem nodeId="README.md" label="README.md" />
    </TreeView>
  );
}

const REVEAL_PRESETS = [
  "fade",
  "scale",
  "slide-up",
  "slide-down",
  "slide-left",
  "slide-right",
] as const satisfies readonly RevealPreset[];

/** `key={preset}` forces `Reveal` to remount when the preset changes, so switching presets while it's visible re-plays the animation instead of just changing its resting state. `mode="wait"` on `AnimatePresence` makes the hide animation finish before a new reveal starts. */
function RevealDemo() {
  const [visible, setVisible] = useState(true);
  const [preset, setPreset] = useState<RevealPreset>("fade");

  return (
    <Stack gap="md">
      <Flex wrap="wrap" gap="sm">
        {REVEAL_PRESETS.map((p) => (
          <Button key={p} size="sm" variant={preset === p ? "solid" : "outline"} onClick={() => setPreset(p)}>
            {p}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => setVisible((v) => !v)}>
          {visible ? "Hide" : "Show"}
        </Button>
      </Flex>
      <div className="flex h-24 items-center rounded-md border border-dashed border-neutral-7 p-4">
        <AnimatePresence mode="wait">
          {visible && (
            <Reveal key={preset} preset={preset} className="rounded-md bg-accent-9 px-4 py-3 text-sm font-medium text-white">
              Animated with the &quot;{preset}&quot; preset
            </Reveal>
          )}
        </AnimatePresence>
      </div>
    </Stack>
  );
}

export function App() {
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(true);
  const notice = useDisclosure({ defaultOpen: true });

  return (
    <TooltipProvider>
      <LayoutSection spacing="lg">
        <Container maxWidth="lg">
          <Stack gap="xl">
            <Flex as="header" wrap="wrap" align="center" justify="between" gap="md">
              <Typography variant="h1">QuickadUI</Typography>
              <ThemeToggle />
            </Flex>

            <Typography variant="lead">
              Everything below is imported from the real, built packages — <code>@quickadui/core</code>, <code>@quickadui/theme</code>,{" "}
              <code>@quickadui/hooks</code>, <code>@quickadui/icons</code>, <code>@quickadui/layout</code>,{" "}
              <code>@quickadui/overlays</code>, <code>@quickadui/forms</code>, <code>@quickadui/data</code>, and{" "}
              <code>@quickadui/animation</code> — nothing on this page is mocked, including this page's own outer structure: the
              vertical rhythm around every section below is a real{" "}
              <code>@quickadui/layout</code> <code>Section</code>/<code>Container</code>/<code>Stack</code>, not hand-rolled classes.
            </Typography>

            {notice.isOpen && (
              <Alert variant="success">
                <AlertTitle>It&apos;s alive</AlertTitle>
                <AlertDescription>
                  The theme toggle above and this alert&apos;s open/close state are both driven by real hooks — <code>useTheme</code>{" "}
                  from <code>@quickadui/theme</code> and <code>useDisclosure</code> from <code>@quickadui/hooks</code>.
                </AlertDescription>
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={notice.close}>
                    Dismiss
                  </Button>
                </div>
              </Alert>
            )}

            <DemoSection title="Buttons">
              <Stack gap="sm">
                {BUTTON_VARIANTS.map((variant) => (
                  <Flex key={variant} wrap="wrap" align="center" gap="sm">
                    <span className="w-24 shrink-0 text-sm text-neutral-11">{variant}</span>
                    {BUTTON_SIZES.map((size) => (
                      <Button key={size} variant={variant} size={size}>
                        {size}
                      </Button>
                    ))}
                    <IconButton
                      aria-label={`Like (${variant} button)`}
                      variant={toIconButtonVariant(variant)}
                      size="sm"
                      onClick={() => setLiked((v) => !v)}
                    >
                      {liked ? "♥" : "♡"}
                    </IconButton>
                  </Flex>
                ))}
              </Stack>
            </DemoSection>

            <DemoSection title="Badges">
              <Flex wrap="wrap" gap="sm">
                {BADGE_VARIANTS.map((variant) => (
                  <Badge key={variant} variant={variant}>
                    {variant}
                  </Badge>
                ))}
              </Flex>
            </DemoSection>

            <DemoSection title="Overlays — Tooltip, Popover, DropdownMenu">
              <Flex wrap="wrap" align="center" gap="md">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>A tooltip, positioned by Radix, styled by @quickadui/core.</TooltipContent>
                </Tooltip>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Click for popover</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Stack gap="xs">
                      <Typography variant="small">Popover content</Typography>
                      <Typography variant="muted">Closes on outside click or Escape — real Radix focus/dismiss behavior.</Typography>
                    </Stack>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserIcon size={16} />
                      Profile
                      <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SettingsIcon size={16} />
                      Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={starred} onCheckedChange={setStarred}>
                      Starred
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Flex>
            </DemoSection>

            <DemoSection title="Overlays — Modal & Drawer (@quickadui/overlays)">
              <Flex wrap="wrap" align="center" gap="md">
                <Modal>
                  <ModalTrigger asChild>
                    <Button variant="outline">Open modal</Button>
                  </ModalTrigger>
                  <ModalContent>
                    <ModalTitle>Delete this item?</ModalTitle>
                    <ModalDescription>This is @quickadui/overlays' Modal — built on the same primitives Dialog as everything else, just centered with a backdrop.</ModalDescription>
                    <ModalFooter>
                      <Button variant="destructive">Delete</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent side="right">
                    <DrawerTitle>Settings</DrawerTitle>
                    <DrawerDescription>Same Dialog primitive as Modal, anchored to a screen edge via the `side` prop instead of centered.</DrawerDescription>
                    <DrawerFooter>
                      <Button variant="outline">Close</Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </Flex>
            </DemoSection>

            <DemoSection title="Overlays — Context Menu & Toast (@quickadui/overlays)">
              <Stack gap="sm">
                <ContextMenu>
                  <ContextMenuTrigger className="flex h-24 items-center justify-center rounded-md border border-dashed border-neutral-7 text-sm text-neutral-11">
                    Right-click here
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem>Copy</ContextMenuItem>
                    <ContextMenuItem>Paste</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                <Flex wrap="wrap" gap="sm">
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast({ title: "Saved", description: "Your changes were saved.", variant: "success" })
                    }
                  >
                    Show a toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: "Undo available",
                        description: "The item was deleted.",
                        actionLabel: "Undo",
                        onAction: () => toast({ title: "Restored", variant: "success" }),
                      })
                    }
                  >
                    Show a toast with an action
                  </Button>
                </Flex>
              </Stack>
            </DemoSection>

            <DemoSection title="Forms (@quickadui/forms)">
              <Typography variant="muted">
                A real form: <code>useForm</code> + <code>zodResolver</code> (react-hook-form + Zod) validating on submit, wired to{" "}
                <code>Input</code>, <code>Textarea</code>, <code>Select</code>, <code>RadioGroup</code>, <code>Switch</code>, and{" "}
                <code>Checkbox</code> through <code>Form</code>/<code>FormField</code>/<code>FormItem</code>/<code>FormControl</code>/
                <code>FormMessage</code>. Try submitting without a name or with an invalid email to see validation errors, or leaving
                the checkbox unchecked.
              </Typography>
              <SignupForm />
            </DemoSection>

            <DemoSection title="Tabs & Accordion">
              <Grid columns="2" gap="lg">
                <Tabs defaultValue="account">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <Typography variant="muted">Account settings go here.</Typography>
                  </TabsContent>
                  <TabsContent value="password">
                    <Typography variant="muted">Password settings go here.</Typography>
                  </TabsContent>
                </Tabs>

                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is this real?</AccordionTrigger>
                    <AccordionContent>Yes — this is the real @quickadui/core Accordion, built on @quickadui/primitives.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Does the chevron rotate?</AccordionTrigger>
                    <AccordionContent>It does, via the data-state attribute Radix sets on the trigger.</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Grid>
            </DemoSection>

            <DemoSection title="Icons">
              <Flex wrap="wrap" gap="lg">
                {ICONS.map(({ name, Icon }) => (
                  <Flex key={name} direction="column" align="center" gap="xs">
                    <Icon size={20} className="text-accent-11" />
                    <span className="text-xs text-neutral-11">{name}</span>
                  </Flex>
                ))}
              </Flex>
            </DemoSection>

            <DemoSection title="Card, Avatar, Spinner, Skeleton">
              <Card>
                <CardHeader>
                  <CardTitle>Team members</CardTitle>
                  <CardDescription>
                    The first avatar below points at a broken image URL on purpose — its fallback ("AL") only appears once radix-ui's
                    real image-load timing decides the image has failed, which is exactly the behavior{" "}
                    <code>@quickadui/primitives</code> wraps.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex align="center" gap="sm">
                    <Avatar>
                      <AvatarImage src="https://broken-image.invalid/nobody.png" alt="Ada Lovelace" />
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                      <AvatarFallback>QA</AvatarFallback>
                    </Avatar>
                  </Flex>
                </CardContent>
                <CardFooter className="gap-3">
                  <Spinner size="sm" label="Loading team" />
                  <Skeleton className="h-4 w-32" />
                </CardFooter>
              </Card>
            </DemoSection>

            <DemoSection title="Data — Table &amp; Pagination (@quickadui/data)">
              <TableDemo />
            </DemoSection>

            <DemoSection title="Data — Stepper (@quickadui/data)">
              <StepperDemo />
            </DemoSection>

            <DemoSection title="Data — Timeline (@quickadui/data)">
              <TimelineDemo />
            </DemoSection>

            <DemoSection title="Data — Tree View (@quickadui/data)">
              <TreeViewDemo />
            </DemoSection>

            <DemoSection title="Animation — Reveal (@quickadui/animation)">
              <Typography variant="muted">
                <code>Reveal</code>, wrapped in <code>AnimatePresence</code> so its exit animation actually plays — pick a preset, then
                toggle it to see both the enter and exit transitions.
              </Typography>
              <RevealDemo />
            </DemoSection>

            <DemoSection title="Typography">
              <Stack gap="xs">
                <Typography variant="h1">Heading 1</Typography>
                <Typography variant="h2">Heading 2</Typography>
                <Typography variant="h3">Heading 3</Typography>
                <Typography variant="h4">Heading 4</Typography>
                <Typography variant="body">Body text — the default paragraph style.</Typography>
                <Typography variant="lead">Lead text — a slightly larger, muted intro paragraph.</Typography>
                <Typography variant="small">Small text.</Typography>
                <Typography variant="muted">Muted text, for secondary information.</Typography>
              </Stack>
            </DemoSection>
          </Stack>
        </Container>
      </LayoutSection>
      <Toaster />
    </TooltipProvider>
  );
}
