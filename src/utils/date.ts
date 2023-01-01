export const getCurrentDate = () => {
  const datetime = new Date();
  return `${datetime.getFullYear()}-${datetime.getMonth() + 1}`;
};
