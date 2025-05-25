import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Controls.css"

function DeleteButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };
  const handleMouseDown = () => setIsActive(true);
  const handleMouseUp = () => setIsActive(false);

  const iconClass = isActive ? "bi-trash3" : isHovered ? "bi-trash3-fill" : "bi-trash3";

  return (
    <a className="btn btn-outline-danger-icon btn-sm trash"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}>
      <b><i className={`bi ${iconClass}`}></i></b>
    </a>
  );
}

export default DeleteButton;
