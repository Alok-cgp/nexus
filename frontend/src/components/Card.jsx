import React from 'react';
import './Card.css';

const Card = ({
  children,
  className = '',
  hover = true,
  shadow = 'medium',
  ...props
}) => {
  const cardClasses = [
    'card',
    `card-shadow-${shadow}`,
    hover ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
