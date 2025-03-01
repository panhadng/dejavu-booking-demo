// add function to get the status of the reservation
export const getReservationStatus = (status: number) => {
    return status === 1 ? 'Pending' : status === 2 ? 'confirmed' : 'Completed';
};

export const getStatusColor = (status:number) => {
    switch (status) {
      case 1: // pending
        return "bg-yellow-500";
      case 2: // confirmed 
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };