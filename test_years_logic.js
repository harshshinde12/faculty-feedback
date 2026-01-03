
const mockPrograms = [
    { _id: "1", name: "P1", academicYears: ["FE", "SE"] },
    { _id: "2", name: "P2", academicYears: "TE, BE" },
    { _id: "3", name: "P3", academicYears: "FY" }, // Single string
    { _id: "4", name: "P4", academicYears: "" }, // Empty string
    { _id: "5", name: "P5" }, // Missing
    { _id: "6", name: "P6", academicYears: [] } // Empty array
];

function testLogic(progId) {
    const selectedProg = mockPrograms.find(p => p._id === progId);
    let years = [];

    if (selectedProg) {
        const ay = selectedProg.academicYears;
        if (Array.isArray(ay)) {
            years = ay;
        } else if (typeof ay === "string" && ay.trim() !== "") {
            console.log(`String detected for ${progId}: ${ay}`);
            years = ay.includes(",") ? ay.split(",").map((y) => y.trim()) : [ay];
        }
    }

    // Fallback
    if (years.length === 0) {
        console.log(`Fallback triggered for ${progId}`);
        years = ["FE", "SE", "TE", "BE", "FY", "SY"];
    }

    return years;
}

console.log("P1 (Array):", testLogic("1"));
console.log("P2 (String list):", testLogic("2"));
console.log("P3 (Single string):", testLogic("3"));
console.log("P4 (Empty string):", testLogic("4"));
console.log("P5 (Missing):", testLogic("5"));
console.log("P6 (Empty array):", testLogic("6"));
