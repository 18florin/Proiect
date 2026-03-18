import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "@/store/admin/customers-slice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminCustomers() {
  const dispatch = useDispatch();
  const { customers, isLoading, error } = useSelector((s) => s.adminCustomers);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCustomers(""));
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => dispatch(fetchCustomers(search))}>Search</Button>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!isLoading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.userName}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.role}</TableCell>
                <TableCell>
                  <Badge
                    className={c.isActive ? "bg-green-500" : "bg-gray-500"}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
