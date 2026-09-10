// Table
export { default as Table } from './table/Table';
export { tableData } from './table/Table.data';
export type { TableColumn, TableSize, TableRowActions } from './table/Table';

// Table capabilities (Dati tecnici automatici per root — vedi ADR021/022)
export { TableCapabilitiesProvider, useTableCapabilities } from './table/TableCapabilities';
export type { TableCapabilities } from './table/TableCapabilities';

// TableLink
export { default as TableLink } from './table-link/TableLink';
export { tableLinkData } from './table-link/TableLink.data';
export type { TableLinkVariant } from './table-link/TableLink';

// StatCard
export { default as StatCard } from './stat-card/StatCard';
export { statCardData } from './stat-card/StatCard.data';
export type { StatCardProps } from './stat-card/StatCard';
