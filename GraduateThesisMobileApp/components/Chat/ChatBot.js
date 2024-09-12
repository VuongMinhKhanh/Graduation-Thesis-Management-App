// const xlsx = require('xlsx');
// import readXlsxFile from "read-excel-file/node";
import xlsx from "xlsx"
import { readFile} from "react-native-fs";

const botId = "botId";
const botName = "ChatBox";
// Read the Excel file
const workbook = xlsx.readFile('ChatBoxScenario.xlsx');
const worksheet = workbook.Sheets['Sheet1'];
const data = xlsx.utils.sheet_to_json(worksheet);

// Function to handle chatbot responses
const handleChatbotResponse = (text, isChatRoomChanged) => {
    if (isChatRoomChanged)
        return
    // Find the matching row in the Excel data
    const matchingRow = data.find((row) => {
        if (row.trigger === 'default') {
        return true;
        }
        return text.toLowerCase().includes(row.trigger.toLowerCase());
    });

    // Return the appropriate response
    if (matchingRow) {
        return [
        {
            _id: matchingRow._id,
            text: matchingRow.response,
            createdAt: new Date(),
            user: {
            _id: matchingRow.botId,
            name: matchingRow.botName
            }
        }
        ];
    } else {
        return [
        {
            _id: 'default',
            text: "Tôi sợ rằng tôi không hiểu câu hỏi của em. Em có cần tôi chuyển cuộc trò chuyện này cho hỗ trợ viên không?",
            createdAt: new Date(),
            user: {
            _id: "botId",
            name: "ChatBox"
            }
        }
        ];
    }
};

export default handleChatbotResponse;