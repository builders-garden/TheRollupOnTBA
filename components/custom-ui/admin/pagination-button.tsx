import { CTSButton } from "../cts-button";

interface PaginationButtonProps {
  disabled: boolean;
  handleChangePage: () => void;
  icon: React.ReactNode;
}

export const PaginationButton = ({
  disabled,
  handleChangePage,
  icon,
}: PaginationButtonProps) => {
  return (
    <CTSButton
      variant="outline"
      className="p-2"
      onClick={handleChangePage}
      disabled={disabled}>
      {icon}
    </CTSButton>
  );
};
