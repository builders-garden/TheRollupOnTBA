import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import { Admin } from "@/lib/database/db.schema";
import { AdminTableRow } from "./admin-table-row";

interface AdminsTableProps {
  admins: Admin[];
  isCreatingAdmin: boolean;
  isUpdatingAdmin: boolean;
}

export const AdminsTable = ({
  admins,
  isCreatingAdmin,
  isUpdatingAdmin,
}: AdminsTableProps) => {
  // Whether there is only one admin remaining
  const isLastAdmin = admins.length === 1;

  return (
    <div className="w-full">
      <h1 className="font-bold text-xl mt-6">Current Admins</h1>
      <Table className="text-base">
        <TableHeader>
          <TableRow className="border-foreground/40 hover:bg-transparent">
            <TableHead>#</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Base Name</TableHead>
            <TableHead>ENS Name</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className="font-bold text-lg">
          {admins.map((admin, index) => (
            <AdminTableRow
              key={admin.address}
              admin={admin}
              index={index}
              isCreatingAdmin={isCreatingAdmin}
              isUpdatingAdmin={isUpdatingAdmin}
              isLastAdmin={isLastAdmin}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
