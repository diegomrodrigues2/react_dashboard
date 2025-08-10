
import { AppData, ContaGestora, ContaAssessor, CbioBtc, SplitExcecao, BrokerCode, MenuItem, ColumnConfig, FieldConfig, ActivityLog } from './types.ts';
import TableIcon from './components/icons/TableIcon.tsx';
import ChartPieIcon from './components/icons/ChartPieIcon.tsx';

const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const INITIAL_CONTA_GESTORA_DATA: ContaGestora[] = [
  { id: generateId(), Conta: 3000, NomeCliente: "Anselmo Araujo", NomeClienteBTB: "", SubManager: "", TIPO: "" },
  { id: generateId(), Conta: 3001, NomeCliente: "Alberto Luis De Souza Araujo", NomeClienteBTB: "", SubManager: "", TIPO: "" },
  { id: generateId(), Conta: 5001, NomeCliente: "Seleccion Acciones Latam", NomeClienteBTB: "", SubManager: "", TIPO: "INR - 4373" },
  { id: generateId(), Conta: 5002, NomeCliente: "Bbva Administradora General de Fondos", NomeClienteBTB: "", SubManager: "", TIPO: "INR - 4373" },
  { id: generateId(), Conta: 5005, NomeCliente: "The Bank Of Nova Scotia", NomeClienteBTB: "", SubManager: "", TIPO: "INR - 4373" },
  { id: generateId(), Conta: 5006, NomeCliente: "Russel Investment", NomeClienteBTB: "", SubManager: "", TIPO: "INR - 4373" },
];

export const INITIAL_CONTA_ASSESSOR_DATA: ContaAssessor[] = [
  { id: generateId(), AssessorSINACOROriginal: "19 - KC835", AssessorSINACOR: "KC835", Assessor: "GRAINS I" },
  { id: generateId(), AssessorSINACOROriginal: "21 - BZ135", AssessorSINACOR: "BZ135", Assessor: "GRAINS I" },
  { id: generateId(), AssessorSINACOROriginal: "23 - BZ136", AssessorSINACOR: "BZ136", Assessor: "GRAINS I" },
  { id: generateId(), AssessorSINACOROriginal: "25 - BZ181", AssessorSINACOR: "BZ181", Assessor: "GRAINS I" },
];

export const INITIAL_CBIO_BTC_DATA: CbioBtc[] = [
  { id: generateId(), Historico: "178", Broker: "NA", ContaTipoB: "N", Segmento: "Cbios", CommodityProduto: "Estorno Corretagem", Mercado: "Renda Fixa" },
  { id: generateId(), Historico: "173", Broker: "NA", ContaTipoB: "N", Segmento: "Cbios", CommodityProduto: "Corretagem", Mercado: "Renda Fixa" },
  { id: generateId(), Historico: "209", Broker: "NA", ContaTipoB: "N", Segmento: "Cbios", CommodityProduto: "Escrituração", Mercado: "Renda Fixa" },
  { id: generateId(), Historico: "845", Broker: "Securities Lending", ContaTipoB: "Y", Segmento: "Stock Lending", CommodityProduto: "Corretagem", Mercado: "Equities" },
];

export const INITIAL_SPLIT_EXCECAO_DATA: SplitExcecao[] = [
  { id: generateId(), DataAlteracao: "2023-01-01", Conta: 6401, Segmento: "BMF", Produto: "CCM", Assessor: "DTVM SALES", Proporcao: 100, AssessorSinacor: "SP100", SegmentoCliente: "Commodities Business" },
  { id: generateId(), DataAlteracao: "2023-01-01", Conta: 20066, Segmento: "BMF", Produto: "CCM", Assessor: "Grains I", Proporcao: 100, AssessorSinacor: "KC835", SegmentoCliente: "Commodities Business" },
  { id: generateId(), DataAlteracao: "2023-01-01", Conta: 20076, Segmento: "BMF", Produto: "DR1", Assessor: "Cattle", Proporcao: 20, AssessorSinacor: "BZ130", SegmentoCliente: "Commodities Business" },
  { id: generateId(), DataAlteracao: "2023-01-01", Conta: 20076, Segmento: "BMF", Produto: "DR1", Assessor: "PNP-1 SP Desk", Proporcao: 80, AssessorSinacor: "PNP - 1", SegmentoCliente: "Commodities Business" },
];

export const INITIAL_BROKER_CODES_DATA: BrokerCode[] = [
  { id: generateId(), Type: "Shared Broker", OTCBrokerCode: "KN061", FUTBrokerCode: "KN061", Commission: 50, ShareCode: "SP100", BCTeam: "Mesa SP", TeamNickname: "Mesa SP", PoolName: "1120", Department: "12102", Entity: "FCB", Region: "Brazil", Office: "Sao Paulo/SP", Head: "Marcel Santos", ChangedOrCreatedOn: "2023-04-20", Status: "Active", Obs: "" },
  { id: generateId(), Type: "Shared Broker", OTCBrokerCode: "BZ151", FUTBrokerCode: "KN500", Commission: 50, ShareCode: "BZ131", BCTeam: "Grains I", TeamNickname: "Grains I", PoolName: "2152", Department: "12004", Entity: "FCB", Region: "Brazil", Office: "Luis Eduardo Magalhaes/BA", Head: "Dadier Zamberlan", ChangedOrCreatedOn: "2023-04-20", Status: "Active", Obs: "" },
  { id: generateId(), Type: "Shared Broker", OTCBrokerCode: "KC855", FUTBrokerCode: "KN057", Commission: 33.33, ShareCode: "KC835", BCTeam: "Grains I", TeamNickname: "Grains I", PoolName: "2100", Department: "12000", Entity: "FCB", Region: "Brazil", Office: "Campinas/SP", Head: "Dadier Zamberlan", ChangedOrCreatedOn: "2023-01-10", Status: "Inactive", Obs: "" },
];

export const INITIAL_APP_DATA: AppData = {
  contaGestora: INITIAL_CONTA_GESTORA_DATA,
  contaAssessor: INITIAL_CONTA_ASSESSOR_DATA,
  cbioBtc: INITIAL_CBIO_BTC_DATA,
  splitExcecao: INITIAL_SPLIT_EXCECAO_DATA,
  brokerCodes: INITIAL_BROKER_CODES_DATA,
};

// Centralized list of all product categories
export const ALL_CATEGORIES = ['Alimentos', 'Eletrônicos', 'Livros', 'Vestuário'];

const contaGestoraColumns: ColumnConfig<ContaGestora>[] = [
  { header: "Conta", accessor: "Conta" },
  { header: "Nome Cliente", accessor: "NomeCliente" },
  { header: "Nome Cliente BTB", accessor: "NomeClienteBTB" },
  { header: "Sub-Manager", accessor: "SubManager" },
  { header: "TIPO", accessor: "TIPO" },
];

const contaGestoraFields: FieldConfig<ContaGestora>[] = [
  { name: "Conta", label: "Conta", type: "number", required: true },
  { name: "NomeCliente", label: "Nome Cliente", type: "text", required: true },
  { name: "NomeClienteBTB", label: "Nome Cliente BTB", type: "text" },
  { name: "SubManager", label: "Sub-Manager", type: "text" },
  { name: "TIPO", label: "TIPO", type: "text" },
];

const contaAssessorColumns: ColumnConfig<ContaAssessor>[] = [
  { header: "Assessor SINACOR Original", accessor: "AssessorSINACOROriginal" },
  { header: "Assessor SINACOR", accessor: "AssessorSINACOR" },
  { header: "Assessor", accessor: "Assessor" },
];

const contaAssessorFields: FieldConfig<ContaAssessor>[] = [
  { name: "AssessorSINACOROriginal", label: "Assessor SINACOR Original", type: "text", required: true },
  { name: "AssessorSINACOR", label: "Assessor SINACOR", type: "text", required: true },
  { name: "Assessor", label: "Assessor", type: "text", required: true },
];

const cbioBtcColumns: ColumnConfig<CbioBtc>[] = [
  { header: "Historico", accessor: "Historico" },
  { header: "Broker", accessor: "Broker" },
  { header: "Conta Tipo B", accessor: "ContaTipoB" },
  { header: "Segmento", accessor: "Segmento" },
  { header: "Commodity (produto)", accessor: "CommodityProduto" },
  { header: "Mercado", accessor: "Mercado" },
];

const cbioBtcFields: FieldConfig<CbioBtc>[] = [
  { name: "Historico", label: "Historico", type: "text", required: true },
  { name: "Broker", label: "Broker", type: "text", required: true },
  { name: "ContaTipoB", label: "Conta Tipo B (Y/N)", type: "select", options: ["Y", "N"], required: true },
  { name: "Segmento", label: "Segmento", type: "text", required: true },
  { name: "CommodityProduto", label: "Commodity (produto)", type: "text", required: true },
  { name: "Mercado", label: "Mercado", type: "text", required: true },
];

const splitExcecaoColumns: ColumnConfig<SplitExcecao>[] = [
  { header: "Data Alteração", accessor: "DataAlteracao" },
  { header: "Conta", accessor: "Conta" },
  { header: "Segmento", accessor: "Segmento" },
  { header: "Produto", accessor: "Produto" },
  { header: "Assessor", accessor: "Assessor" },
  { header: "Proporção (%)", accessor: "Proporcao", render: (value) => `${value}%` },
  { header: "Assessor Sinacor", accessor: "AssessorSinacor" },
  { header: "Segmento_Cliente", accessor: "SegmentoCliente" },
];

const splitExcecaoFields: FieldConfig<SplitExcecao>[] = [
  { name: "DataAlteracao", label: "Data Alteração", type: "date", required: true }, 
  { name: "Conta", label: "Conta", type: "number", required: true },
  { name: "Segmento", label: "Segmento", type: "text", required: true },
  { name: "Produto", label: "Produto", type: "text", required: true },
  { name: "Assessor", label: "Assessor", type: "text", required: true },
  { name: "Proporcao", label: "Proporção (e.g., 100 for 100%)", type: "number", required: true },
  { name: "AssessorSinacor", label: "Assessor Sinacor", type: "text", required: true },
  { name: "SegmentoCliente", label: "Segmento Cliente", type: "text", required: true },
];

const brokerCodesColumns: ColumnConfig<BrokerCode>[] = [
  { header: "Type", accessor: "Type" },
  { header: "OTC_BrokerCode", accessor: "OTCBrokerCode" },
  { header: "FUT_BrokerCode", accessor: "FUTBrokerCode" },
  { header: "Commission (%)", accessor: "Commission", render: (value) => `${value}%` },
  { header: "ShareCode", accessor: "ShareCode" },
  { header: "BC_Team", accessor: "BCTeam" },
  { header: "TeamNickname", accessor: "TeamNickname" },
  { header: "PoolName", accessor: "PoolName" },
  { header: "Department", accessor: "Department" },
  { header: "Entity", accessor: "Entity" },
  { header: "Region", accessor: "Region" },
  { header: "Office", accessor: "Office" },
  { header: "Head", accessor: "Head" },
  { header: "Changed or Created on", accessor: "ChangedOrCreatedOn" },
  { header: "Status", accessor: "Status" },
  { header: "Obs", accessor: "Obs" },
];

const brokerCodesFields: FieldConfig<BrokerCode>[] = [
  { name: "Type", label: "Type", type: "select", options: ["Shared Broker", "Exclusive Broker", "Introducing Broker"], required: true },
  { name: "OTCBrokerCode", label: "OTC_BrokerCode", type: "text", required: true },
  { name: "FUTBrokerCode", label: "FUT_BrokerCode", type: "text", required: true },
  { name: "Commission", label: "Commission (e.g., 50 for 50%)", type: "number", required: true },
  { name: "ShareCode", label: "ShareCode", type: "text", required: true },
  { name: "BCTeam", label: "BC_Team", type: "text", required: true },
  { name: "TeamNickname", label: "TeamNickname", type: "text" },
  { name: "PoolName", label: "PoolName", type: "text" },
  { name: "Department", label: "Department", type: "text" },
  { name: "Entity", label: "Entity", type: "select", options: ["FCB", "SCI", "FCI", "SCS"], required: true },
  { name: "Region", label: "Region", type: "select", options: ["Brazil", "North America", "Europe", "Asia", "LATAM"], required: true },
  { name: "Office", label: "Office", type: "select", options: ["Sao Paulo/SP", "Luis Eduardo Magalhaes/BA", "Campinas/SP", "New York/NY", "London/UK", "Chicago/IL", "Singapore"], required: true },
  { name: "Head", label: "Head", type: "text" },
  { name: "ChangedOrCreatedOn", label: "Changed or Created on", type: "date" }, 
  { name: "Status", label: "Status", type: "select", options: ["Active", "Inactive", "Deactivated and being re-used"], required: true },
  { name: "Obs", label: "Obs", type: "text" },
];


export const MENU_ITEMS: MenuItem<any>[] = [
  { id: "dashboard", label: "Dashboard", icon: ChartPieIcon },
  { id: "contaGestora", label: "Conta Gestora (PNP)", icon: TableIcon, columns: contaGestoraColumns, fields: contaGestoraFields, dataKey: "contaGestora" },
  { id: "contaAssessor", label: "Conta Assessor (Commodity)", icon: TableIcon, columns: contaAssessorColumns, fields: contaAssessorFields, dataKey: "contaAssessor" },
  { id: "cbioBtc", label: "CBIO e BTC", icon: TableIcon, columns: cbioBtcColumns, fields: cbioBtcFields, dataKey: "cbioBtc" },
  { 
    id: "splitExcecao", 
    label: "SPLIT Exceção Produtos", 
    icon: TableIcon, 
    columns: splitExcecaoColumns, 
    fields: splitExcecaoFields, 
    dataKey: "splitExcecao",
    getRowClass: (item: SplitExcecao) => {
        const proporcao = Number(item.Proporcao);
        if (proporcao === 100) return 'bg-green-50';
        if (proporcao > 0 && proporcao < 100) return 'bg-yellow-50';
        return '';
    }
  },
  { 
    id: "brokerCodes", 
    label: "Broker Codes", 
    icon: TableIcon, 
    columns: brokerCodesColumns, 
    fields: brokerCodesFields, 
    dataKey: "brokerCodes",
    getRowClass: (item: BrokerCode) => {
        if (item.Status === 'Inactive' || item.Status === 'Deactivated and being re-used') return 'bg-red-50';
        if (item.Status === 'Active') return 'bg-blue-50';
        return '';
    }
  },
];

export { generateId };

// Note: MOCK_USER_DATA for initializing App's currentUser state is removed. 
// User specific data (name, role) is now set dynamically during login.

// Mock Recent Activity Data (still used for UserProfilePage)
export const MOCK_RECENT_ACTIVITIES: ActivityLog[] = [
  { id: generateId(), timestamp: new Date(Date.now() - 3600000).toLocaleString('pt-BR'), action: "Edit", details: "Changed 'Conta' to '3005'", targetTable: "Conta Gestora (PNP)" },
  { id: generateId(), timestamp: new Date(Date.now() - 7200000).toLocaleString('pt-BR'), action: "Add", details: "Added new item with Assessor 'GRAINS II'", targetTable: "Conta Assessor (Commodity)" },
  { id: generateId(), timestamp: new Date(Date.now() - 10800000).toLocaleString('pt-BR'), action: "Delete", details: "Removed item with Historico '178'", targetTable: "CBIO e BTC" },
  { id: generateId(), timestamp: new Date(Date.now() - 86400000).toLocaleString('pt-BR'), action: "View", details: "Accessed Broker Codes table", targetTable: "Broker Codes"},
  { id: generateId(), timestamp: new Date(Date.now() - 172800000).toLocaleString('pt-BR'), action: "Edit", details: "Updated 'Proporcao' for Conta '20076'", targetTable: "SPLIT Exceção Produtos" },
];

export const ACTIVITY_LOG_COLUMNS: ColumnConfig<ActivityLog>[] = [
    { header: "Timestamp", accessor: "timestamp" },
    { header: "Action", accessor: "action" },
    { header: "Details", accessor: "details" },
    { header: "Target Table", accessor: "targetTable" },
];
