export  const PERSON_TYPE={
    person:'PERSON',
    organization:'ORGANIZATION'
}

export  const INSURANCE_OBJECT_TYPES={
    BORROWER:'BORROWER',
    VEHICLE:'VEHICLE',
    PROPERTY:'PROPERTY',
    AGRICULTURE:'AGRICULTURE',
    GTKOBJECT:'GTKOBJECT',
    OTHEROBJECT:'OTHEROBJECT ',
    // SMROBJECT:'SMROBJECT',
    // OPOOBJECT:'OPOOBJECT',
    // REALESTATE:'REALESTATE',
}
export const STATUS_LIST_COLOR = {
    sent:'green',
    new:'blue',
    paid:'cyan',
    payed:'cyan',
    partialPaid:'orange',
    partialAttached:'orange',
}
export const STATUS_LIST = [
    {
        value:'new',
        label:'new'
    },
    {
        value:'paid',
        label:'paid'
    },
    {
        value:'payed',
        label:'payed'
    },
    {
        value:'partialPaid',
        label:'partialPaid'
    },
    {
        value:'sent',
        label:'sent'
    },
]
export const CLAIM_STATUS_LIST = {
    submitted: 'blue',
    draft: 'default',
    reviewing: 'warning',
    accepted: 'green',
    paid: 'cyan',
    denied: 'red',
    docs_collecting:'orange',
}
