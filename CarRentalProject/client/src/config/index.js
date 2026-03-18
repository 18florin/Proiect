//src/config/index.js
export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const addVehicleFormElements = [
  {
    label: "Identifier",
    name: "identifier",
    componentType: "input",
    type: "text",
    placeholder: "Enter unique vehicle ID (e.g. VIN)",
  },
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter vehicle title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter vehicle description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "sedan", label: "Sedan" },
      { id: "suv", label: "SUV" },
      { id: "hatchback", label: "Hatchback" },
      { id: "convertible", label: "Convertible" },
      { id: "pickup", label: "Pickup Truck" },
      { id: "van", label: "Van" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "toyota", label: "Toyota" },
      { id: "bmw", label: "BMW" },
      { id: "mercedes", label: "Mercedes" },
      { id: "audi", label: "Audi" },
      { id: "ford", label: "Ford" },
      { id: "honda", label: "Honda" },
    ],
  },
  {
    label: "Year",
    name: "year",
    componentType: "input",
    type: "number",
    placeholder: "Enter manufacture year",
  },
  {
    label: "Location",
    name: "location",
    componentType: "input",
    type: "text",
    placeholder: "Enter city or area",
  },
  {
    label: "Price per Day",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter vehicle price per day",
  },
  {
    label: "Discounted Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter discounted price (optional)",
  },
  {
    label: "Available?",
    name: "isAvailable",
    componentType: "select",
    options: [
      { id: "true", label: "Available" },
      { id: "false", label: "Rented" },
    ],
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "vehicles",
    label: "Vehicles",
    path: "/shop/listing",
  },
  {
    id: "sedan",
    label: "Sedans",
    path: "/shop/listing",
  },
  {
    id: "suv",
    label: "SUVs",
    path: "/shop/listing",
  },
  {
    id: "hatchback",
    label: "Hatchbacks",
    path: "/shop/listing",
  },
  {
    id: "convertible",
    label: "Convertibles",
    path: "/shop/listing",
  },
  {
    id: "pickup",
    label: "Pickup Trucks",
    path: "/shop/listing",
  },
  {
    id: "van",
    label: "Vans",
    path: "/shop/listing",
  },
  {
    id: "search",
    label: "Search",
    path: "/shop/search",
  },
  {
    id: "merch",
    label: "Merch",
    path: "/shop/merch",
  },
];

export const categoryOptionsMap = {
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  convertible: "Convertible",
  pickup: "Pickup Truck",
  van: "Van",
};

export const brandOptionsMap = {
  toyota: "Toyota",
  bmw: "BMW",
  mercedes: "Mercedes",
  audi: "Audi",
  ford: "Ford",
  honda: "Honda",
};

export const filterOptions = {
  category: [
    { id: "sedan", label: "Sedan" },
    { id: "suv", label: "SUV" },
    { id: "hatchback", label: "Hatchback" },
    { id: "convertible", label: "Convertible" },
    { id: "pickup", label: "Pickup Truck" },
    { id: "van", label: "Van" },
  ],
  brand: [
    { id: "toyota", label: "Toyota" },
    { id: "bmw", label: "BMW" },
    { id: "mercedes", label: "Mercedes" },
    { id: "audi", label: "Audi" },
    { id: "ford", label: "Ford" },
    { id: "honda", label: "Honda" },
  ],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
  { id: "year-newest", label: "Year: Newest First" },
  { id: "year-oldest", label: "Year: Oldest First" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
