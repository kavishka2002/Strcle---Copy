export interface ProvisionedAccountSeed {
  id: string;
  username: string;
  shopName: string;
  ownerContact: string;
  passwordHash: string;
  salt: string;
  active: boolean;
  createdAt: number;
  role?: "admin" | "shop";
  mustChangePassword?: boolean;
  isTrial?: boolean;
}

export const provisionedAccountSeeds: ProvisionedAccountSeed[] = [
  {
    id: "admin-p321",
    username: "P321",
    shopName: "Little Paper Bookshop",
    ownerContact: "",
    passwordHash: "iwbRXrlnVVAAKGuhtOvj2ArW736A62jZooTr3Y9MaTM=",
    salt: "i0BGr6kR/6/wbXAYMynwGA==",
    active: true,
    createdAt: 1792755911000,
    role: "admin",
    mustChangePassword: false
  },
  {
    id: "trial-t123",
    username: "T123",
    shopName: "PaperBloom Free Trial",
    ownerContact: "",
    passwordHash: "QA8p/eTYA9aH4AFYRHIaCY9Dq8BrNJXNvOghYr4t7Ao=",
    salt: "uxIii+wTkujl2+PviPieKQ==",
    active: true,
    createdAt: 1792866000000,
    role: "shop",
    mustChangePassword: false,
    isTrial: true
  },
  {
    id: "shop-danu-communication",
    username: "Danu",
    shopName: "Danu communication",
    ownerContact: "",
    passwordHash: "t2B74tcJcZwfcv4DyP0tQOstH29KBTM2M/SrsTmp6Tk=",
    salt: "WnyoSNNBdisisQbe6HKaOg==",
    active: true,
    createdAt: 1792912853000,
    role: "shop",
    mustChangePassword: false
  }
];
