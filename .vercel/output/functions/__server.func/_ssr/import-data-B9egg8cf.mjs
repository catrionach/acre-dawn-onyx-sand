import { A as isBuildReportGrid, F as parseBuildReportGrid, H as recordsForSheet, I as parseFlexibleDate, K as todayIso, L as parseFlexibleStamp, O as getSql, R as parseLookupSheets, V as readXlsx, dt as parseCsv, h as addCalendarDays, j as isLookupWorkbook, r as QT_CAUSES, y as detectSheetKey } from "./types-CcVUDIXB.mjs";
import { n as applyBuildReport, r as replaceLookup } from "./api-CAsxdSCK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/import-data-B9egg8cf.js
function bump(map, key) {
	map[key] = (map[key] ?? 0) + 1;
}
function cell(rec, ...keys) {
	for (const k of keys) {
		const v = rec[k];
		if (v != null && v.trim() !== "") return v.trim();
	}
	return "";
}
function asId(value) {
	const t = value.trim();
	if (/^\d+\.0+$/.test(t)) return t.replace(/\.0+$/, "");
	return t;
}
function asBool(value, fallback) {
	if (!value.trim()) return fallback;
	const v = value.trim().toLowerCase();
	if ([
		"yes",
		"y",
		"true",
		"1",
		"x"
	].includes(v)) return true;
	if ([
		"no",
		"n",
		"false",
		"0"
	].includes(v)) return false;
	return fallback;
}
function asQty(value, fallback = 1) {
	if (!value.trim()) return fallback;
	const n = Number.parseInt(value, 10);
	return Number.isFinite(n) && n >= 1 ? n : fallback;
}
function asHours(value, fallback = 0) {
	if (!value.trim()) return fallback;
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : fallback;
}
function asWeeks(value) {
	if (!value.trim()) return null;
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : null;
}
function woStatusOf(value, fallback = "pending") {
	const v = value.trim().toLowerCase().replace(/\s+/g, "_");
	if (v === "pending" || v === "active" || v === "closed" || v === "cancelled" || v === "on_hold") return v;
	if (v === "hold" || v === "onhold") return "on_hold";
	return fallback;
}
function unitStatusOf(value) {
	const v = value.trim().toLowerCase().replace(/[_-]+/g, " ");
	if (v === "in build" || v === "on shelf" || v === "shipped") return v;
	return "in build";
}
function orderDateOf(rec) {
	return parseFlexibleDate(cell(rec, "order_date", "ordered", "date_ordered", "ordered_date", "date"));
}
function soStatusOf(value) {
	const v = value.trim().toLowerCase().replace(/\s+/g, "_");
	if (v === "waiting_on_customer" || v === "waiting" || v === "on_hold") return "waiting_on_customer";
	if (v === "despatched" || v === "dispatched") return "despatched";
	if (v === "cancelled") return "cancelled";
	return "open";
}
function ticketStatusOf(value) {
	return value.trim().toLowerCase() === "closed" ? "closed" : "open";
}
function parseCauses(value) {
	if (!value.trim()) return ["TBD"];
	let parts = [];
	try {
		const parsed = JSON.parse(value);
		if (Array.isArray(parsed)) parts = parsed.map((x) => String(x));
	} catch {
		parts = value.split(/[;,|]/);
	}
	const allowed = new Set(QT_CAUSES);
	const out = [];
	for (const p of parts) {
		const lower = p.trim().toLowerCase();
		const match = QT_CAUSES.find((c) => c.toLowerCase() === lower);
		if (match && allowed.has(match) && !out.includes(match)) out.push(match);
	}
	return out.length ? out : ["TBD"];
}
function isOpen(status) {
	return status === "pending" || status === "active" || status === "on_hold";
}
function b64ToBytes(b64) {
	return Uint8Array.from(Buffer.from(b64, "base64"));
}
function emptyBucket() {
	return {
		parts: [],
		work_orders: [],
		units: [],
		quality_tickets: [],
		sales_orders: [],
		sales_lines: [],
		hardware_history: [],
		build_order: [],
		build_tasks: []
	};
}
function collect(files) {
	const bucket = emptyBucket();
	const errors = [];
	const lookups = [];
	const reports = [];
	for (const file of files) try {
		if (file.kind === "xlsx") {
			const sheets = readXlsx(b64ToBytes(file.content));
			if (isLookupWorkbook(file.name, sheets)) {
				lookups.push(parseLookupSheets(sheets));
				continue;
			}
			for (const sheet of sheets) {
				if (isBuildReportGrid(sheet.rows[0] ?? [])) {
					reports.push(...parseBuildReportGrid(sheet.rows));
					continue;
				}
				const key = detectSheetKey(sheet.name, sheet.rows[0] ?? []);
				if (!key || key === "readme") continue;
				bucket[key].push(...recordsForSheet(sheet.rows));
			}
		} else {
			const grid = parseCsv(file.content);
			if (isLookupWorkbook(file.name, [{
				name: file.name,
				rows: grid
			}])) {
				lookups.push(parseLookupSheets([{
					name: file.name,
					rows: grid
				}]));
				continue;
			}
			if (isBuildReportGrid(grid[0] ?? [])) {
				reports.push(...parseBuildReportGrid(grid));
				continue;
			}
			const key = detectSheetKey(file.name, grid[0] ?? []);
			if (!key || key === "readme") {
				errors.push({
					sheet: file.name,
					row: "",
					message: "Could not tell which table this CSV is. Use the template headers."
				});
				continue;
			}
			bucket[key].push(...recordsForSheet(grid));
		}
	} catch (err) {
		errors.push({
			sheet: file.name,
			row: "",
			message: err instanceof Error ? err.message : "Could not read file"
		});
	}
	return {
		bucket,
		errors,
		lookups,
		reports
	};
}
async function nextQt(sql) {
	const rows = await sql`select ticket_number from quality_tickets`;
	let max = 0;
	for (const row of rows) {
		const m = /^QT-(\d+)$/i.exec(row.ticket_number);
		if (m) max = Math.max(max, Number(m[1]));
	}
	return `QT-${max + 1}`;
}
async function applyFloorImport(files, loadState) {
	const sql = await getSql();
	const { bucket, errors, lookups, reports } = collect(files);
	const report = {
		inserted: {},
		updated: {},
		skipped: {},
		errors
	};
	for (const lookup of lookups) {
		await replaceLookup(sql, lookup);
		bump(report.updated, "build_component_lookup");
		report.inserted.build_components = lookup.components.length;
		report.inserted.build_batteries = lookup.batteries.length;
	}
	if (reports.length) {
		const result = await applyBuildReport(sql, reports, "Load", (row, message) => {
			report.errors.push({
				sheet: "build_report",
				row,
				message
			});
		});
		if (result.inserted) report.inserted.build_records = result.inserted;
		if (result.updated) report.updated.build_records = result.updated;
		if (result.createdWo) report.inserted.build_report_work_orders = result.createdWo;
	}
	for (const rec of bucket.parts) {
		const partNumber = asId(cell(rec, "part_number", "part"));
		if (!partNumber) {
			report.errors.push({
				sheet: "parts",
				row: "",
				message: "Missing part_number"
			});
			continue;
		}
		try {
			const existing = await sql`
        select * from parts where part_number = ${partNumber} limit 1
      `;
			if (existing[0]) {
				const cur = existing[0];
				await sql`
          update parts set
            name = ${cell(rec, "name") || String(cur.name ?? "")},
            logger = ${cell(rec, "logger") || String(cur.logger ?? "")},
            type = ${cell(rec, "type") || String(cur.type ?? "")},
            counts = ${cell(rec, "counts") || String(cur.counts ?? "")},
            directional = ${asBool(cell(rec, "directional"), Boolean(cur.directional))},
            build_time_hours = ${asHours(cell(rec, "build_time_hours"), Number(cur.build_time_hours) || 0)},
            notes = ${cell(rec, "notes") || String(cur.notes ?? "")},
            active = ${asBool(cell(rec, "active"), cur.active !== false)}
          where part_number = ${partNumber}
        `;
				bump(report.updated, "parts");
			} else {
				await sql`
          insert into parts (
            part_number, name, logger, type, counts, directional, build_time_hours, notes, active
          ) values (
            ${partNumber},
            ${cell(rec, "name")},
            ${cell(rec, "logger")},
            ${cell(rec, "type")},
            ${cell(rec, "counts")},
            ${asBool(cell(rec, "directional"), false)},
            ${asHours(cell(rec, "build_time_hours"))},
            ${cell(rec, "notes")},
            ${asBool(cell(rec, "active"), true)}
          )
        `;
				bump(report.inserted, "parts");
			}
		} catch (err) {
			report.errors.push({
				sheet: "parts",
				row: partNumber,
				message: err instanceof Error ? err.message : "Save failed"
			});
		}
	}
	for (const rec of bucket.work_orders) {
		const woNumber = asId(cell(rec, "wo_number", "work_order_number"));
		if (!woNumber) {
			report.errors.push({
				sheet: "work_orders",
				row: "",
				message: "Missing wo_number"
			});
			continue;
		}
		try {
			const existing = await sql`
        select * from work_orders where wo_number = ${woNumber} limit 1
      `;
			const status = woStatusOf(cell(rec, "status"), existing[0] ? woStatusOf(String(existing[0].status ?? "pending")) : "pending");
			const today = todayIso();
			if (existing[0]) {
				const cur = existing[0];
				let dateStarted = cur.date_started ?? null;
				let dateClosed = cur.date_closed ?? null;
				const prev = woStatusOf(String(cur.status ?? "pending"));
				if (cell(rec, "date_started")) dateStarted = parseFlexibleDate(cell(rec, "date_started"));
				else if (status === "active" && !dateStarted) dateStarted = today;
				if (status === "closed") dateClosed = parseFlexibleDate(cell(rec, "date_closed")) ?? dateClosed ?? today;
				else if (prev === "closed") dateClosed = null;
				await sql`
          update work_orders set
            part = ${cell(rec, "part", "part_number") || String(cur.part ?? "")},
            qty = ${asQty(cell(rec, "qty"), Number(cur.qty) || 1)},
            status = ${status},
            build_time_hours = ${cell(rec, "build_time_hours") ? asHours(cell(rec, "build_time_hours")) : cur.build_time_hours ?? null},
            date_started = ${dateStarted},
            date_closed = ${dateClosed},
            assigned_build = ${cell(rec, "assigned_build") || String(cur.assigned_build ?? "")},
            built_in_sage = ${asBool(cell(rec, "built_in_sage"), Boolean(cur.built_in_sage))},
            notes_to_production = ${cell(rec, "notes_to_production") || String(cur.notes_to_production ?? "")},
            notes_from_sales = ${cell(rec, "notes_from_sales") || String(cur.notes_from_sales ?? "")},
            customer_need_date = ${parseFlexibleDate(cell(rec, "customer_need_date")) ?? cur.customer_need_date ?? null}
          where wo_number = ${woNumber}
        `;
				if (isOpen(prev) && !isOpen(status)) await sql`delete from build_order where wo_number = ${woNumber}`;
				if (!isOpen(prev) && isOpen(status)) {
					if (!(await sql`
            select wo_number from build_order where wo_number = ${woNumber}
          `).length) await sql`insert into build_order (wo_number, position) values (${woNumber}, ${((await sql`
              select max(position) as max_pos from build_order
            `)[0]?.max_pos ?? -1) + 1})`;
				}
				bump(report.updated, "work_orders");
			} else {
				const dateAdded = parseFlexibleDate(cell(rec, "date_added")) ?? today;
				const dateStarted = parseFlexibleDate(cell(rec, "date_started")) ?? (status === "active" ? dateAdded : null);
				const dateClosed = parseFlexibleDate(cell(rec, "date_closed")) ?? (status === "closed" ? today : null);
				await sql`
          insert into work_orders (
            wo_number, part, qty, status, date_added, date_started, date_closed,
            assigned_build, built_in_sage, notes_to_production, notes_from_sales,
            customer_need_date, build_time_hours
          ) values (
            ${woNumber},
            ${cell(rec, "part", "part_number")},
            ${asQty(cell(rec, "qty"))},
            ${status},
            ${dateAdded},
            ${dateStarted},
            ${dateClosed},
            ${cell(rec, "assigned_build")},
            ${asBool(cell(rec, "built_in_sage"), false)},
            ${cell(rec, "notes_to_production")},
            ${cell(rec, "notes_from_sales")},
            ${parseFlexibleDate(cell(rec, "customer_need_date"))},
            ${cell(rec, "build_time_hours") ? asHours(cell(rec, "build_time_hours")) : null}
          )
        `;
				if (isOpen(status)) await sql`insert into build_order (wo_number, position) values (${woNumber}, ${((await sql`
            select max(position) as max_pos from build_order
          `)[0]?.max_pos ?? -1) + 1})
            on conflict (wo_number) do nothing`;
				bump(report.inserted, "work_orders");
			}
		} catch (err) {
			report.errors.push({
				sheet: "work_orders",
				row: woNumber,
				message: err instanceof Error ? err.message : "Save failed"
			});
		}
	}
	for (const rec of bucket.units) {
		const woNumber = asId(cell(rec, "work_order_number", "wo_number"));
		if (!woNumber) {
			report.errors.push({
				sheet: "units",
				row: "",
				message: "Missing work_order_number"
			});
			continue;
		}
		try {
			if (!(await sql`
        select wo_number from work_orders where wo_number = ${woNumber} limit 1
      `)[0]) {
				report.errors.push({
					sheet: "units",
					row: woNumber,
					message: `Work order ${woNumber} not found — load work_orders first`
				});
				continue;
			}
			let unitId = asId(cell(rec, "unit_id"));
			if (unitId) {
				const existing = await sql`
          select * from units where unit_id = ${unitId} limit 1
        `;
				if (existing[0]) {
					const cur = existing[0];
					await sql`
            update units set
              serial_or_id = ${cell(rec, "serial_or_id") || String(cur.serial_or_id ?? "")},
              status = ${unitStatusOf(cell(rec, "status") || String(cur.status ?? "in build"))},
              sales_order_number = ${cell(rec, "sales_order_number", "so_number") || cur.sales_order_number},
              despatch_date = ${parseFlexibleDate(cell(rec, "despatch_date")) ?? cur.despatch_date}
            where unit_id = ${unitId}
          `;
					bump(report.updated, "units");
					continue;
				}
			} else {
				const taken = await sql`
          select unit_id from units where work_order_number = ${woNumber}
        `;
				let n = taken.length + 1;
				const used = new Set(taken.map((r) => r.unit_id));
				while (used.has(`${woNumber}-${n}`)) n += 1;
				unitId = `${woNumber}-${n}`;
			}
			await sql`
        insert into units (
          work_order_number, unit_id, serial_or_id, status, sales_order_number, despatch_date, notes
        ) values (
          ${woNumber},
          ${unitId},
          ${cell(rec, "serial_or_id")},
          ${unitStatusOf(cell(rec, "status"))},
          ${cell(rec, "sales_order_number", "so_number") || null},
          ${parseFlexibleDate(cell(rec, "despatch_date"))},
          ${"[]"}::jsonb
        )
      `;
			bump(report.inserted, "units");
		} catch (err) {
			report.errors.push({
				sheet: "units",
				row: woNumber,
				message: err instanceof Error ? err.message : "Save failed"
			});
		}
	}
	for (const rec of bucket.quality_tickets) {
		const woNumber = asId(cell(rec, "work_order_number", "wo_number"));
		try {
			let woPart = "";
			if (woNumber) {
				const wo = await sql`
          select part from work_orders where wo_number = ${woNumber} limit 1
        `;
				if (!wo[0]) {
					report.errors.push({
						sheet: "quality_tickets",
						row: woNumber,
						message: `Work order ${woNumber} not found`
					});
					continue;
				}
				woPart = wo[0].part;
			}
			let ticketNumber = asId(cell(rec, "ticket_number"));
			const status = ticketStatusOf(cell(rec, "status"));
			const opened = parseFlexibleDate(cell(rec, "date_opened")) ?? todayIso();
			const closed = status === "closed" ? todayIso() : null;
			const unitId = asId(cell(rec, "unit_id")) || null;
			const causes = JSON.stringify(parseCauses(cell(rec, "causes", "cause")));
			const part = cell(rec, "part", "part_number") || woPart;
			const further = asBool(cell(rec, "further_action", "furtheraction"), false);
			if (ticketNumber) {
				if ((await sql`
          select ticket_number from quality_tickets where ticket_number = ${ticketNumber} limit 1
        `)[0]) {
					await sql`
            update quality_tickets set
              work_order_number = ${woNumber || null},
              unit_id = ${unitId},
              part = ${part},
              title = ${cell(rec, "title")},
              problem = ${cell(rec, "problem")},
              causes = ${causes}::jsonb,
              further_action = ${further},
              status = ${status},
              assigned_to = ${cell(rec, "assigned_to", "assigned_build")},
              date_closed = ${closed}
            where ticket_number = ${ticketNumber}
          `;
					bump(report.updated, "quality_tickets");
					continue;
				}
			} else ticketNumber = await nextQt(sql);
			await sql`
        insert into quality_tickets (
          ticket_number, work_order_number, unit_id, part, title, problem,
          causes, further_action, status, date_opened, date_closed, assigned_to, notes
        ) values (
          ${ticketNumber},
          ${woNumber || null},
          ${unitId},
          ${part},
          ${cell(rec, "title")},
          ${cell(rec, "problem")},
          ${causes}::jsonb,
          ${further},
          ${status},
          ${opened},
          ${closed},
          ${cell(rec, "assigned_to", "assigned_build")},
          ${"[]"}::jsonb
        )
      `;
			bump(report.inserted, "quality_tickets");
		} catch (err) {
			report.errors.push({
				sheet: "quality_tickets",
				row: woNumber,
				message: err instanceof Error ? err.message : "Save failed"
			});
		}
	}
	for (const rec of bucket.sales_orders) {
		const soNumber = asId(cell(rec, "so_number"));
		if (!soNumber) {
			report.errors.push({
				sheet: "sales_orders",
				row: "",
				message: "Missing so_number"
			});
			continue;
		}
		try {
			const existing = await sql`
        select * from sales_orders where so_number = ${soNumber} limit 1
      `;
			const orderDate = orderDateOf(rec);
			const lead = asWeeks(cell(rec, "lead_time_weeks"));
			const overrideTarget = parseFlexibleDate(cell(rec, "target_despatch"));
			const status = soStatusOf(cell(rec, "status"));
			let target = overrideTarget;
			let isOverride = Boolean(overrideTarget);
			if (!target && orderDate && lead != null) {
				target = addCalendarDays(orderDate, Math.round(lead * 7));
				isOverride = false;
			}
			if (existing[0]) {
				const cur = existing[0];
				await sql`
          update sales_orders set
            company = ${cell(rec, "company") || String(cur.company ?? "")},
            order_date = ${orderDate ?? cur.order_date},
            lead_time_weeks = ${lead ?? cur.lead_time_weeks},
            target_despatch = ${target ?? cur.target_despatch},
            target_despatch_is_override = ${cell(rec, "target_despatch") ? isOverride : Boolean(cur.target_despatch_is_override)},
            status = ${cell(rec, "status") ? status : String(cur.status ?? "open")},
            sage_id = ${cell(rec, "sage_id") || String(cur.sage_id ?? "")}
          where so_number = ${soNumber}
        `;
				bump(report.updated, "sales_orders");
			} else {
				await sql`
          insert into sales_orders (
            so_number, company, order_date, lead_time_weeks, target_despatch,
            target_despatch_is_override, status, sage_id
          ) values (
            ${soNumber},
            ${cell(rec, "company")},
            ${orderDate},
            ${lead},
            ${target},
            ${isOverride},
            ${status},
            ${cell(rec, "sage_id")}
          )
        `;
				bump(report.inserted, "sales_orders");
			}
		} catch (err) {
			report.errors.push({
				sheet: "sales_orders",
				row: soNumber,
				message: err instanceof Error ? err.message : "Save failed"
			});
		}
	}
	let lastSo = "";
	const lineRows = [...bucket.sales_lines, ...bucket.sales_orders.filter((rec) => cell(rec, "part", "part_number", "item"))];
	for (const rec of lineRows) {
		let soNumber = asId(cell(rec, "so_number", "sage_number", "sage_id", "built_in_sage"));
		if (!soNumber) soNumber = lastSo;
		else lastSo = soNumber;
		const part = cell(rec, "part", "part_number", "item", "product", "sku");
		if (!soNumber && !part) continue;
		if (!part) {
			if (!cell(rec, "qty")) continue;
			report.errors.push({
				sheet: "sales_lines",
				row: soNumber || "",
				message: `SO ${soNumber || "?"} has qty but no part number`
			});
			continue;
		}
		if (!soNumber) {
			report.errors.push({
				sheet: "sales_lines",
				row: part,
				message: "Need so_number and part"
			});
			continue;
		}
		try {
			if (!(await sql`
        select so_number from sales_orders where so_number = ${soNumber} limit 1
      `)[0]) {
				const orderDate = orderDateOf(rec);
				const company = cell(rec, "company");
				await sql`
          insert into sales_orders (so_number, company, order_date, status)
          values (${soNumber}, ${company}, ${orderDate}, ${"open"})
        `;
			} else {
				const orderDate = orderDateOf(rec);
				const company = cell(rec, "company");
				if (orderDate || company) await sql`
            update sales_orders set
              order_date = coalesce(${orderDate}, order_date),
              company = case when ${company} = ${""} then company else ${company} end
            where so_number = ${soNumber}
          `;
			}
			const qty = asQty(cell(rec, "qty"));
			const woNumber = asId(cell(rec, "work_order_number", "wo_number"));
			const existing = await sql`
        select id from sales_lines
        where so_number = ${soNumber}
          and part = ${part}
          and work_order_number = ${woNumber}
        limit 1
      `;
			if (existing[0]) {
				await sql`
          update sales_lines set qty = ${qty}
          where id = ${existing[0].id}
        `;
				bump(report.updated, "sales_lines");
				continue;
			}
			await sql`
        insert into sales_lines (so_number, part, qty, work_order_number)
        values (${soNumber}, ${part}, ${qty}, ${woNumber})
      `;
			bump(report.inserted, "sales_lines");
		} catch (err) {
			report.errors.push({
				sheet: "sales_lines",
				row: soNumber,
				message: err instanceof Error ? err.message : "Save failed"
			});
		}
	}
	for (const rec of bucket.hardware_history) {
		const woNumber = asId(cell(rec, "wo_number", "work_order_number"));
		const text = cell(rec, "text");
		if (!woNumber || !text) {
			report.errors.push({
				sheet: "hardware_history",
				row: woNumber,
				message: "Need wo_number and text"
			});
			continue;
		}
		try {
			const rows = await sql`
        select hardware_history from work_orders where wo_number = ${woNumber} limit 1
      `;
			if (!rows[0]) {
				report.errors.push({
					sheet: "hardware_history",
					row: woNumber,
					message: `Work order ${woNumber} not found`
				});
				continue;
			}
			const note = {
				date: parseFlexibleStamp(cell(rec, "date")) ?? `${todayIso()}T09:00`,
				author: cell(rec, "author"),
				text
			};
			let current = [];
			const raw = rows[0].hardware_history;
			if (Array.isArray(raw)) current = raw;
			else if (typeof raw === "string") try {
				current = JSON.parse(raw);
			} catch {
				current = [];
			}
			if (current.some((n) => n.date === note.date && n.author === note.author && n.text === note.text)) {
				bump(report.skipped, "hardware_history");
				continue;
			}
			const next = [...current, note];
			await sql`
        update work_orders
        set hardware_history = ${JSON.stringify(next)}::jsonb
        where wo_number = ${woNumber}
      `;
			bump(report.inserted, "hardware_history");
		} catch (err) {
			report.errors.push({
				sheet: "hardware_history",
				row: woNumber,
				message: err instanceof Error ? err.message : "Save failed"
			});
		}
	}
	if (bucket.build_order.length) try {
		const wanted = bucket.build_order.map((rec) => ({
			pos: Number.parseFloat(cell(rec, "position")) || 0,
			wo: asId(cell(rec, "wo_number", "work_order_number"))
		})).filter((x) => x.wo).sort((a, b) => a.pos - b.pos);
		const open = await sql`
        select wo_number, status from work_orders
        where status in ('pending', 'active', 'on_hold')
      `;
		const openSet = new Set(open.map((r) => r.wo_number));
		const listed = [];
		for (const item of wanted) {
			if (!openSet.has(item.wo)) {
				report.errors.push({
					sheet: "build_order",
					row: item.wo,
					message: `${item.wo} is not pending/active/on hold — skipped`
				});
				continue;
			}
			if (!listed.includes(item.wo)) listed.push(item.wo);
		}
		const rest = open.map((r) => r.wo_number).filter((n) => !listed.includes(n));
		const next = [...listed, ...rest];
		await sql`delete from build_order`;
		for (let i = 0; i < next.length; i += 1) await sql`insert into build_order (wo_number, position) values (${next[i]}, ${i})`;
		bump(report.updated, "build_order");
	} catch (err) {
		report.errors.push({
			sheet: "build_order",
			row: "",
			message: err instanceof Error ? err.message : "Save failed"
		});
	}
	return {
		report,
		state: await loadState()
	};
}
//#endregion
export { applyFloorImport };
