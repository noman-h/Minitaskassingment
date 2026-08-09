const tasks=require('../Models/TaskModel')
const axios = require("axios");
const { log } = require('console');
const csv = require("csv-parser");
const { loadEnvFile } = require('process');
const { Readable } = require("stream");

exports.addtask = async (req, res) => {
  try {
    const { title, description, duedate, userid } = req.body;

    console.log(req.body);
    
    if (!(title && description && duedate && userid)) {
      return res.status(400).json({ message: "all keys are required" });
    }

    const data=req.body
    const result = await tasks.create(data);
    return res.status(201).json({ message: "task added successfully" });
    
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server erroe", err });
  }
};

exports.googlesheetadd = async (req, res) => {
  try {
    const { url, userid } = req.body;

    // Validation
    if (!url) {
      return res.status(400).json({
        message: "Google Sheet URL is required",
      });
    }

    let csvUrl = "";
    let importId = "";

    // 1. Check if it's a "Publish to web" link (/spreadsheets/d/e/2PACX-...)
    const pubMatch = url.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
    
    // 2. Check if it's a standard sheet link (/spreadsheets/d/1BxiMVs...)
    const stdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

    if (pubMatch) {
      importId = pubMatch[1];
      csvUrl = `https://docs.google.com/spreadsheets/d/e/${importId}/pub?output=csv`;
    } else if (stdMatch && stdMatch[1] !== "e") {
      importId = stdMatch[1];
      csvUrl = `https://docs.google.com/spreadsheets/d/${importId}/export?format=csv`;
    } else {
      return res.status(400).json({
        message: "Invalid Google Sheets URL structure",
      });
    }

    // Prevent duplicate imports
    const alreadyImported = await tasks.findOne({
      importid: importId,
    });

    if (alreadyImported) {
      return res.status(409).json({
        message: "This Google Sheet has already been imported",
      });
    }

    // Fetch Google Sheet CSV data
    const response = await axios.get(csvUrl);

    const rows = [];

    // Convert CSV into objects
    await new Promise((resolve, reject) => {
      Readable.from([response.data])
        .pipe(csv())
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Google Sheet contains no data",
      });
    }

    // Convert Sheet rows into Tasks
    const taskdata = rows.map((row) => ({
      title: row.title,
      description: row.description,
      duedate: row.duedate,
      status: row.status || "pending",
      userid: userid,
      importid: importId,
    }));

    // Validate tasks
    for (const task of taskdata) {
      if (!task.title) {
        return res.status(400).json({
          message: "Every task must have a title",
        });
      }

      if (!task.duedate) {
        return res.status(400).json({
          message: `Due date is required for task: ${task.title}`,
        });
      }

      if (
        !["pending", "completed", "notcompleted"].includes(
          task.status
        )
      ) {
        return res.status(400).json({
          message:
            `Invalid status for task "${task.title}". ` +
            `Use pending, completed, or notcompleted.`,
        });
      }
    }

    const insertedTasks = await tasks.insertMany(taskdata);

    return res.status(201).json({
      message: "Tasks imported successfully",
      count: insertedTasks.length,
      tasks: insertedTasks,
    });
  } catch (error) {
    console.error("Error importing Google Sheet:", error);
    return res.status(500).json({
      message: "Failed to import Google Sheet",
      error: error.message,
    });
  }
};


exports.gettask = async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      return res.status(400).json({ message: "bad request" });
    }

    // 1. Extract query parameters with default fallbacks
    const {
      page = 1,
      limit = 6,
      status,
      search,
      sortBy
    } = req.query;

    // Convert page & limit to numbers
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 6);
    const skip = (pageNum - 1) * limitNum;

    // 2. Construct dynamic Mongo query
    const query = { userid };

    // Status Filter
    if (status && status !== "All") {
        query.status = status.toLowerCase();
    }

    // Search Query (Case-insensitive search on title or description)
    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // 3. Define Sorting Options
    let sortOptions = {};
    switch (sortBy) {
      case "dueDateDesc":
        sortOptions = { duedate: -1 };
        break;
      case "titleAsc":
        sortOptions = { title: 1 };
        break;
      case "titleDesc":
        sortOptions = { title: -1 };
        break;
      case "createdNewest":
        sortOptions = { createdAt: -1 };
        break;
      case "createdOldest":
        sortOptions = { createdAt: 1 };
        break;
      case "dueDateAsc":
      default:
        sortOptions = { duedate: 1 };
        break;
    }

    // 4. Fetch Total Count & Paginated Results
    const totalTasks = await tasks.countDocuments(query);
    const result = await tasks
      .find(query)
      .populate("userid")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // 5. Send paginated response structure
    return res.status(200).json({
      tasks: result,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limitNum),
      currentPage: pageNum,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error", err });
  }
};

exports.updatetask = async (req, res) => {
  try {
    const id = req.body._id;
    const data = req.body;

    const result = await tasks.findByIdAndUpdate(id, data);
    return res.status(200).json({ message: "task updated successfully" });
    
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server erroe", err });
  }
};

exports.taskstatus = async (req, res) => {
  try {
    const { id, status } = req.query;

    const result = await tasks.findByIdAndUpdate(id, {status});
    return res.status(200).json({ message: "status changed" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server erroe", err });
  }
};

exports.deletetask = async (req, res) => {
  try {
    const id = req.params.id;

    if(!id){
        return res.status(400).json({message:'badrequest'})
    }

    const result = await tasks.findByIdAndDelete(id);
    if(!result){
        return res.status(404).json("task not found")
    }

    return res.status(200).json({ message: "deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};