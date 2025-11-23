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

// GET /api/funds - Fetch all funds data with filtering and sorting
// Used by Admin Data Table View
// Query parameters:
//   - name: fuzzy search for fund name
//   - strategies: filter by strategies (comma-separated or array)
//   - geographies: filter by geographies (comma-separated or array)
//   - currency: filter by currency
//   - minFundSize: minimum fund size
//   - maxFundSize: maximum fund size
//   - minVintage: minimum vintage year
//   - maxVintage: maximum vintage year
//   - sortBy: name | fundSize | vintage
//   - sortOrder: asc | desc | a-z | z-a
app.get("/api/funds", (req: Request, res: Response): void => {
  let funds = readFundsData();

  // Apply filters
  const {
    name,
    strategies,
    geographies,
    currency,
    minFundSize,
    maxFundSize,
    minVintage,
    maxVintage,
  } = req.query;

  // Filter by name (fuzzy search)
  if (name && typeof name === "string") {
    const searchTerm = name.toLowerCase();
    funds = funds.filter((fund) =>
      fund.name.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by strategies
  if (strategies) {
    const strategyList = Array.isArray(strategies)
      ? strategies.map((s) => String(s))
      : String(strategies)
          .split(",")
          .map((s) => s.trim());
    funds = funds.filter((fund) =>
      strategyList.some((strategy) => fund.strategies.includes(strategy))
    );
  }

  // Filter by geographies
  if (geographies) {
    const geographyList = Array.isArray(geographies)
      ? geographies.map((g) => String(g))
      : String(geographies)
          .split(",")
          .map((g) => g.trim());
    funds = funds.filter((fund) =>
      geographyList.some((geography) => fund.geographies.includes(geography))
    );
  }

  // Filter by currency
  if (currency && typeof currency === "string") {
    funds = funds.filter((fund) => fund.currency === currency);
  }

  // Filter by fund size range
  if (minFundSize) {
    const min = parseFloat(String(minFundSize));
    if (Number.isFinite(min)) {
      funds = funds.filter((fund) => fund.fundSize >= min);
    }
  }
  if (maxFundSize) {
    const max = parseFloat(String(maxFundSize));
    if (Number.isFinite(max)) {
      funds = funds.filter((fund) => fund.fundSize <= max);
    }
  }

  // Filter by vintage range
  if (minVintage) {
    const min = parseInt(String(minVintage), 10);
    if (Number.isFinite(min)) {
      funds = funds.filter((fund) => fund.vintage >= min);
    }
  }
  if (maxVintage) {
    const max = parseInt(String(maxVintage), 10);
    if (Number.isFinite(max)) {
      funds = funds.filter((fund) => fund.vintage <= max);
    }
  }

  // Apply sorting
  const { sortBy, sortOrder } = req.query;
  if (sortBy && typeof sortBy === "string") {
    const order = String(sortOrder || "asc").toLowerCase();
    const isAscending = order === "asc" || order === "a-z";

    switch (sortBy) {
      case "name":
        funds.sort((a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return isAscending ? comparison : -comparison;
        });
        break;
      case "fundSize":
        funds.sort((a, b) => {
          const comparison = a.fundSize - b.fundSize;
          return isAscending ? comparison : -comparison;
        });
        break;
      case "vintage":
        funds.sort((a, b) => {
          const comparison = a.vintage - b.vintage;
          return isAscending ? comparison : -comparison;
        });
        break;
    }
  }

  res.json(funds);
});

// GET /api/funds/meta - Get filter options for dropdowns
// Returns unique values for strategies, geographies, currencies, and managers
app.get("/api/funds/meta", (_req: Request, res: Response): void => {
  const funds = readFundsData();

  // Extract and deduplicate strategies (flatten arrays first)
  const allStrategies = funds.flatMap((fund) => fund.strategies);
  const uniqueStrategies = [...new Set(allStrategies)].sort();

  // Extract and deduplicate geographies (flatten arrays first)
  const allGeographies = funds.flatMap((fund) => fund.geographies);
  const uniqueGeographies = [...new Set(allGeographies)].sort();

  // Extract and deduplicate currencies
  const allCurrencies = funds.map((fund) => fund.currency);
  const uniqueCurrencies = [...new Set(allCurrencies)].sort();

  // Extract and deduplicate managers
  const allManagers = funds.flatMap((fund) => fund.managers);
  const uniqueManagers = [...new Set(allManagers)].sort();

  res.json({
    strategies: uniqueStrategies,
    geographies: uniqueGeographies,
    currencies: uniqueCurrencies,
    managers: uniqueManagers,
  });
});

// GET /api/funds/:name - Fetch a single fund by name
// Used by User Facing Data View and Admin Edit View
app.get("/api/funds/:name", (req: Request, res: Response): void => {
  const funds = readFundsData();

  // Decode URL parameter with error handling
  let fundName: string;
  try {
    fundName = decodeURIComponent(req.params.name);
  } catch {
    res.status(400).json({
      error: "Invalid URL encoding",
      message:
        "The fund name contains invalid URL encoding. Please use proper encoding (e.g., spaces should be %20)",
    });
    return;
  }

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

  // Decode URL parameter with error handling
  let fundName: string;
  try {
    fundName = decodeURIComponent(req.params.name);
  } catch {
    res.status(400).json({
      error: "Invalid URL encoding",
      message:
        "The fund name contains invalid URL encoding. Please use proper encoding (e.g., spaces should be %20)",
    });
    return;
  }

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

  // Decode URL parameter with error handling
  let fundName: string;
  try {
    fundName = decodeURIComponent(req.params.name);
  } catch {
    res.status(400).json({
      error: "Invalid URL encoding",
      message:
        "The fund name contains invalid URL encoding. Please use proper encoding (e.g., spaces should be %20)",
    });
    return;
  }

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
