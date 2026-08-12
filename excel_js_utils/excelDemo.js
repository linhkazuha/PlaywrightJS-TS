const ExcelJs = require('exceljs');


async function writeExcelTest(searchText, replaceText, filePath) {
    let output = {row:-1, column:-1};
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile('./assets/download.xlsx');
    const worksheet = workbook.getWorksheet('Sheet1');
    readExcel(worksheet, searchText);
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.value === "Apple") {
                output.row = rowNumber;
                output.column = colNumber;
            }
        })
    })
    const cell = worksheet.getCell(output.row, output.column);

    cell.value = replaceText;
    await workbook.xlsx.writeFile('./assets/download.xlsx');

}

async function readExcel(worksheet, searchText){
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
            if (cell.value === "Banana") {
                output.row = rowNumber;
                output.column = colNumber;
            }
        })
    })

}

writeExcelTest();