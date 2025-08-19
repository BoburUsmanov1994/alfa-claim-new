import { includes } from "lodash";
import config from "../config";
import { t } from "i18next";

export const menuData = (role) => [
  includes([config.ROLES.admin], role) && {
    id: 7,
    title: t("Продукты"),
    path: "/products",
    submenu: [
      {
        id: 1,
        title: t("Все продукты"),
        path: "/products/all",
      },
      {
        id: 44,
        title: t("Группы продуктов"),
        path: "/products/product-groups",
      },
      {
        id: 18,
        title: t("Подгруппы продуктов"),
        path: "/products/product-subgroups",
      },
      {
        id: 19,
        title: t("Статус продукта"),
        path: "/products/product-status",
      },
    ],
  },
  includes([config.ROLES.admin, config.ROLES.user], role) && {
    id: 222,
    title: t("Соглашения"),
    path: "/agreements",
  },
  includes([config.ROLES.admin, config.ROLES.user], role) && {
    id: 2,
    title: t("Клиенты"),
    path: "/clients",
    submenu: [
      includes([config.ROLES.admin, config.ROLES.user], role) && {
        id: 1,
        title: t("Физические лица"),
        path: "/clients/physical",
      },
      includes([config.ROLES.admin, config.ROLES.user], role) && {
        id: 2,
        title: t("Юридические лица"),
        path: "/clients/juridical",
      },
      includes([config.ROLES.admin], role) && {
        id: 5,
        title: t("Тип человека"),
        path: "/clients/person-type",
      },
    ],
  },
  includes([config.ROLES.admin], role) && {
    id: 8,
    title: t("Агенты"),
    path: "/agents",
    submenu: [
      {
        id: 1,
        title: t("Страховые агенты"),
        path: "/agents/insurance-agents",
      },
      {
        id: 2,
        title: t("Agent types"),
        path: "/agents/types",
      },
      {
        id: 3,
        title: t("Agent roles"),
        path: "/agents/roles",
      },
      {
        id: 4,
        title: t("Agent status"),
        path: "/agents/status",
      },
      {
        id: 5,
        title: t("Bank"),
        path: "/agents/bank",
      },
      {
        id: 6,
        title: t("Комиссия и РПМ"),
        path: "/agents/commission",
      },
      {
        id: 7,
        title: t("Подготовка актов выполненных работ"),
        path: "/agents/report",
      },
      {
        id: 8,
        title: t("Управления актами выполненных работ"),
        path: "/agents/report-control",
      },
    ],
  },
  includes([config.ROLES.admin], role) && {
    id: 222,
    title: t("Аккаунты"),
    path: "/accounts",
    submenu: [
      {
        id: 1,
        title: t("Users"),
        path: "/accounts/list",
      },
      {
        id: 2,
        title: t("Account role"),
        path: "/accounts/role",
      },
      {
        id: 3,
        title: t("Account status"),
        path: "/accounts/status",
      },
    ],
  },
  includes([config.ROLES.admin], role) && {
    id: 111,
    title: t("Филиалы и сотрудники"),
    path: "/branches",
    submenu: [
      {
        id: 1,
        title: t("Филиалы"),
        path: "/branches/list",
      },
      {
        id: 2,
        title: t("Employees"),
        path: "/branches/employees",
      },
      {
        id: 3,
        title: t("Position"),
        path: "/branches/position",
      },
      {
        id: 31,
        title: t("Branch level"),
        path: "/handbook/branch-level",
      },
      {
        id: 32,
        title: t("Branch status"),
        path: "/handbook/branch-status",
      },
      {
        id: 33,
        title: t("Банк реквизиты филиалов"),
        path: "/handbook/branch-bank-settings",
      },
    ],
  },
  includes([config.ROLES.admin], role) && {
    id: 3,
    title: t("Бухгалтерия"),
    path: "/accounting",
    submenu: [
      {
        id: 1,
        title: t("Импорт платёжные документы"),
        path: "/accounting/import-payment-documents",
      },
      {
        id: 2,
        title: t("Распределение"),
        path: "/accounting/distribution",
      },
      {
        id: 3,
        title: t("Тип распределения"),
        path: "/accounting/distribution-type",
      },
      {
        id: 4,
        title: t("К полису"),
        path: "/accounting/policy",
      },
      {
        id: 55,
        title: t("Счета"),
        path: "/accounting/account",
      },
      {
        id: 6,
        title: t("Transaction logs"),
        path: "/accounting/transaction-logs",
      },
    ],
  },
  includes([config.ROLES.admin, config.ROLES.user], role) && {
    id: 2,
    title: t("БСО"),
    path: "/bco",
    submenu: [
      includes([config.ROLES.admin], role) && {
        id: 11,
        title: t("БСО"),
        path: "/bco",
      },
      includes([config.ROLES.admin], role) && {
        id: 1,
        title: t("Тип БСО"),
        path: "/bco/type",
      },
      includes([config.ROLES.admin], role) && {
        id: 2,
        title: t("БСО статус полиса"),
        path: "/bco/policy-status",
      },
      includes([config.ROLES.admin], role) && {
        id: 3,
        title: t("БСО статус"),
        path: "/bco/status",
      },
      includes([config.ROLES.admin], role) && {
        id: 4,
        title: t("БСО язык"),
        path: "/bco/language",
      },
      includes([config.ROLES.admin], role) && {
        id: 5,
        title: t("БСО blanks"),
        path: "/accounting/bco-blanks",
      },
      includes([config.ROLES.admin, config.ROLES.user], role) && {
        id: 6,
        title: t("ACTS"),
        path: "/accounting/act",
      },
      includes([config.ROLES.admin], role) && {
        id: 7,
        title: t("Act status"),
        path: "/bco/act-status",
      },
      includes([config.ROLES.admin], role) && {
        id: 8,
        title: t("Warehouse"),
        path: "/accounting/warehouse",
      },
    ],
  },
  includes([config.ROLES.admin, config.ROLES.endorsement], role) && {
    id: 2222,
    title: t("Индоссамент"),
    path: "/endorsement",
  },
  includes(
    [
      config.ROLES.admin,
      config.ROLES.osgop,
      config.ROLES.osgor,
      config.ROLES.user,
    ],
    role
  ) && {
    id: 300,
    title: t("Страховой"),
    path: "/insurance",
    submenu: [
      includes(
        [config.ROLES.admin, config.ROLES.osgor, config.ROLES.user],
        role
      ) && {
        id: 1,
        title: t("ОСГОР"),
        path: "/insurance/osgor",
      },
      includes(
        [config.ROLES.admin, config.ROLES.osgop, config.ROLES.user],
        role
      ) && {
        id: 2,
        title: t("ОСГОП"),
        path: "/insurance/osgop",
      },
      includes([config.ROLES.admin], role) && {
        id: 3,
        title: t("ОСАГО"),
        path: "/insurance/osago",
      },
      includes([config.ROLES.admin, config.ROLES.user], role) && {
        id: 4,
        title: t("СМР"),
        path: "/insurance/smr",
      },
      includes([config.ROLES.admin], role) && {
        id: 5,
        title: t("СМР Распределение"),
        path: "/insurance/smr/distribute",
      },
      includes([config.ROLES.admin], role) && {
        id: 6,
        title: t("Страхования кредитов НБУ"),
        path: "/insurance/nbu-credits",
      },
    ],
  },

  includes([config.ROLES.admin], role) && {
    id: 10,
    title: t("Справочники"),
    path: "/handbook",
    submenu: [
      {
        id: 3,
        title: t("Регионы"),
        path: "/handbook/regions",
      },
      {
        id: 4,
        title: t("Districts"),
        path: "/handbook/districts",
      },
      {
        id: 444,
        title: t("Insurance form"),
        path: "/handbook/insurance-form",
      },
      {
        id: 5,
        title: t("Объект страхования"),
        path: "/handbook/object",
      },
      {
        id: 6,
        title: t("Вид объекта страхования"),
        path: "/handbook/object-type",
      },
      {
        id: 8,
        title: t("Тип полиции"),
        path: "/handbook/police-type",
      },
      {
        id: 9,
        title: t("Тип риска"),
        path: "/handbook/risk-type",
      },
      {
        id: 10,
        title: t("Риск"),
        path: "/handbook/risk",
      },
      // {
      //     id: 11,
      //     title: 'Ролевой аккаунт',
      //     path: '/handbook/role',
      // },
      {
        id: 12,
        title: t("Класс страхования"),
        path: "/handbook/insurance-classes",
      },
      // {
      //     id: 13,
      //     title: 'Подкласс страхования',
      //     path: '/handbook/insurance-subclasses',
      // },
      {
        id: 14,
        title: t("Тип сектора"),
        path: "/handbook/sector-type",
      },
      {
        id: 15,
        title: t("Формат полиса"),
        path: "/handbook/policy-formats",
      },
      // {
      //     id: 16,
      //     title: 'Тип страховщика',
      //     path: '/handbook/insurer-type',
      // },
      {
        id: 19,
        title: t("Документы формы заявки"),
        path: "/handbook/application-form-docs",
      },
      {
        id: 20,
        title: t("Форма контракта"),
        path: "/handbook/contract-form",
      },
      {
        id: 21,
        title: t("Дополнительные документы"),
        path: "/handbook/additional-documents",
      },
      {
        id: 22,
        title: t("Тип урегулирование претензии"),
        path: "/handbook/settlement-claim-type",
      },
      {
        id: 23,
        title: t("Тип возврата"),
        path: "/handbook/refund-type",
      },
      {
        id: 24,
        title: t("Тип франшизы"),
        path: "/handbook/franchise-type",
      },
      {
        id: 24,
        title: t("База франшизы"),
        path: "/handbook/franchise-base",
      },
      {
        id: 25,
        title: t("Способ оплаты"),
        path: "/handbook/payment-type",
      },
      {
        id: 28,
        title: t("Genders"),
        path: "/handbook/genders",
      },
      {
        id: 34,
        title: t("Reasons"),
        path: "/handbook/reasons",
      },
      {
        id: 35,
        title: t("Typeofendorsements"),
        path: "/handbook/typeofendorsements",
      },
      {
        id: 36,
        title: t("Status endorsements"),
        path: "/handbook/endorsements-status",
      },
      {
        id: 37,
        title: t("Payment currency"),
        path: "/handbook/payment-currency",
      },
      {
        id: 38,
        title: t("Policy status"),
        path: "/handbook/policy-status",
      },
      {
        id: 39,
        title: t("Payment status"),
        path: "/handbook/payment-status",
      },
      {
        id: 41,
        title: t("Vehicle type"),
        path: "/handbook/vehicle-type",
      },
      {
        id: 42,
        title: t("Property type"),
        path: "/handbook/property-type",
      },
      {
        id: 46,
        title: t("Property right type"),
        path: "/handbook/property-right-type",
      },
      {
        id: 43,
        title: t("Agricultural type"),
        path: "/handbook/agricultural-type",
      },
      {
        id: 44,
        title: t("Measurement type"),
        path: "/handbook/measurement-type",
      },
      {
        id: 45,
        title: t("Document type"),
        path: "/handbook/document-type",
      },
    ],
  },
  includes([config.ROLES.admin], role) && {
    id: 222,
    title: t("Translations"),
    path: "/handbook/translations",
  },
];
