const AdminResoActionButton = ({ action, onClick }) => {
  const handleClick = () => {
    onClick(action);
  };

  return (
    <button className="admin-reso-action-button" onClick={handleClick}>
      {action.label}
    </button>
  );
}