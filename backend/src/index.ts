import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import * as fs from "node:fs";
import * as path from "node:path";

// Define the Fund interface based on the data structure
interface Fund {
  name: string;
  strategies: string[];
  geographies: string[];
  currency: string;
  fundSize: number;
  vintage: number;
  managers: string[];
  description: string;
}

const app = express();
const port = process.env.PORT || 3000;

// Enable JSON parsing for request bodies
app.use(express.json());

// Enable CORS for frontend requests
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Path to the funds data file
const dataFilePath = path.join(__dirname, "../data/funds_data.json");

// Helper function to read funds data from JSON file
const readFundsData = (): Fund[] => {
  try {
    const fileContent = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(fileContent) as Fund[];
  } catch (error) {
    console.error("Error reading funds data:", error);
    return [];
  }
};

// Helper function to write funds data to JSON file
const writeFundsData = (data: Fund[]): boolean => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing funds data:", error);
    return false;
  }
};

// GET /api/funds - Fetch all funds data
// Used by Admin Data Table View
app.get("/api/funds", (_req: Request, res: Response) => {
  const funds = readFundsData();
  res.json(funds);
});

// GET /api/funds/:name - Fetch a single fund by name
// Used by User Facing Data View and Admin Edit View
app.get("/api/funds/:name", (req: Request, res: Response): void => {
  const funds = readFundsData();
  const fundName = decodeURIComponent(req.params.name);
  const fund = funds.find((f: Fund) => f.name === fundName);

  if (!fund) {
    res.status(404).json({ error: "Fund not found" });
    return;
  }

  res.json(fund);
});

// PUT /api/funds/:name - Update a single fund
// Used by Admin Edit View
app.put("/api/funds/:name", (req: Request, res: Response): void => {
  const funds = readFundsData();
  const fundName = decodeURIComponent(req.params.name);
  const fundIndex = funds.findIndex((f: Fund) => f.name === fundName);

  if (fundIndex === -1) {
    res.status(404).json({ error: "Fund not found" });
    return;
  }

  // Update the fund with new data
  funds[fundIndex] = { ...funds[fundIndex], ...req.body };

  // Save to file
  if (writeFundsData(funds)) {
    res.json(funds[fundIndex]);
  } else {
    res.status(500).json({ error: "Failed to save fund data" });
  }
});

// DELETE /api/funds/:name - Delete a single fund
// Used by Admin Edit View
app.delete("/api/funds/:name", (req: Request, res: Response): void => {
  const funds = readFundsData();
  const fundName = decodeURIComponent(req.params.name);
  const fundIndex = funds.findIndex((f: Fund) => f.name === fundName);

  if (fundIndex === -1) {
    res.status(404).json({ error: "Fund not found" });
    return;
  }

  // Remove the fund from array
  const deletedFund = funds.splice(fundIndex, 1)[0];

  // Save to file
  if (writeFundsData(funds)) {
    res.json({ message: "Fund deleted successfully", fund: deletedFund });
  } else {
    res.status(500).json({ error: "Failed to save fund data" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
