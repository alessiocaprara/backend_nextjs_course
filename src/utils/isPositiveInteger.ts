const isPositiveInteger = (inputStr: string) => {
    console.log("inputStr parameter: " + inputStr);
    const number = Number(inputStr);
    const isInteger = Number.isInteger(number);
    const isPositive = number > 0;
    return isInteger && isPositive;
};

export default isPositiveInteger;