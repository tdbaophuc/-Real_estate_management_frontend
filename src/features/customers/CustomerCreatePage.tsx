import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../shared/ui/Button";
import { useText } from "../../shared/i18n/useText";
import { CustomerForm, toCustomerRequest, type CustomerFormValues } from "./CustomerForm";
import { createCustomer } from "./customerApi";

export function CustomerCreatePage() {
  const tx = useText();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => createCustomer(toCustomerRequest(values)),
    onSuccess: (customer) => {
      queryClient.setQueryData(["customer", customer.id], customer);
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate(`/customers/${customer.id}`, { replace: true });
    }
  });

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/customers">
          <ArrowLeft size={16} />
          {tx("Back to customers")}
        </Link>
      </Button>
      <div className="section-header">
        <div>
          <p className="eyebrow">{tx("Customers")}</p>
          <h2>{tx("Create customer")}</h2>
        </div>
      </div>
      <CustomerForm
        submitLabel={tx("Create customer")}
        onSubmit={(values) => createMutation.mutateAsync(values).then(() => undefined)}
      />
    </section>
  );
}
