use serde::Deserialize;
use serde_json::{Value, json};
use std::io::BufRead;
use std::process::Command;
use tracing::info;

#[derive(Deserialize)]
struct JsonRpcRequest {
    jsonrpc: String,
    id: Option<Value>,
    method: String,
    #[serde(default)]
    params: Value,
}

fn run_zeta(args: &[&str]) -> Result<String, String> {
    let output = Command::new("zetachain")
        .args(args)
        .output()
        .map_err(|e| format!("Failed to run zetachain CLI: {e}. Is it installed?"))?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(format!(
            "zetachain failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

fn tool_definitions() -> Value {
    json!([
        {"name":"check_balance","description":"Check token balance for an address on ZetaChain","inputSchema":{"type":"object","properties":{"address":{"type":"string"},"token":{"type":"string","default":"ZETA"}},"required":["address"]}},
        {"name":"get_fees","description":"Get current ZetaChain cross-chain fees","inputSchema":{"type":"object","properties":{}}},
        {"name":"get_supported_chains","description":"List chains supported by ZetaChain","inputSchema":{"type":"object","properties":{}}},
        {"name":"get_inbound_hash_to_cctx","description":"Get cross-chain transaction by inbound hash","inputSchema":{"type":"object","properties":{"hash":{"type":"string"}},"required":["hash"]}},
        {"name":"get_cctx","description":"Get cross-chain transaction details","inputSchema":{"type":"object","properties":{"hash":{"type":"string"}},"required":["hash"]}},
        {"name":"get_pending_cctx","description":"Get pending cross-chain transactions","inputSchema":{"type":"object","properties":{"chain_id":{"type":"string"}}}},
        {"name":"track_cctx","description":"Track a cross-chain transaction status","inputSchema":{"type":"object","properties":{"hash":{"type":"string"}},"required":["hash"]}},
        {"name":"get_zeta_price","description":"Get current ZETA token price","inputSchema":{"type":"object","properties":{}}},
        {"name":"get_block_height","description":"Get current block height","inputSchema":{"type":"object","properties":{}}},
        {"name":"send_zeta","description":"Send ZETA tokens","inputSchema":{"type":"object","properties":{"from":{"type":"string"},"to":{"type":"string"},"amount":{"type":"string"}},"required":["from","to","amount"]}},
        {"name":"deposit","description":"Deposit tokens from connected chain to ZetaChain","inputSchema":{"type":"object","properties":{"amount":{"type":"string"},"chain":{"type":"string"}},"required":["amount","chain"]}},
        {"name":"withdraw","description":"Withdraw tokens from ZetaChain to connected chain","inputSchema":{"type":"object","properties":{"amount":{"type":"string"},"chain":{"type":"string"}},"required":["amount","chain"]}},
        {"name":"get_tss_address","description":"Get TSS (Threshold Signature Scheme) address","inputSchema":{"type":"object","properties":{}}},
        {"name":"get_observers","description":"Get list of ZetaChain observers","inputSchema":{"type":"object","properties":{}}},
        {"name":"get_node_info","description":"Get ZetaChain node information","inputSchema":{"type":"object","properties":{}}}
    ])
}

fn call_tool(name: &str, args: &Value) -> Result<Value, String> {
    match name {
        "check_balance" => {
            let addr = args["address"].as_str().ok_or("address required")?;
            let token = args["token"].as_str().unwrap_or("ZETA");
            let out = run_zeta(&["balances", addr, "--denom", token, "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_fees" => {
            let out = run_zeta(&["fees", "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_supported_chains" => {
            let out = run_zeta(&["chains", "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_inbound_hash_to_cctx" => {
            let hash = args["hash"].as_str().ok_or("hash required")?;
            let out = run_zeta(&["cctx", "inbound", hash, "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_cctx" => {
            let hash = args["hash"].as_str().ok_or("hash required")?;
            let out = run_zeta(&["cctx", hash, "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_pending_cctx" => {
            let chain = args["chain_id"].as_str().unwrap_or("");
            let mut a = vec!["cctx", "pending", "--output", "json"];
            if !chain.is_empty() {
                a.push("--chain");
                a.push(chain);
            }
            let out = run_zeta(&a)?;
            Ok(json!({"output": out.trim()}))
        }
        "track_cctx" => {
            let hash = args["hash"].as_str().ok_or("hash required")?;
            let out = run_zeta(&["cctx", "track", hash, "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_zeta_price" => {
            let out = run_zeta(&["price", "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_block_height" => {
            let out = run_zeta(&["status", "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "send_zeta" => {
            let from = args["from"].as_str().ok_or("from required")?;
            let to = args["to"].as_str().ok_or("to required")?;
            let amount = args["amount"].as_str().ok_or("amount required")?;
            let out = run_zeta(&["tx", "send", from, to, amount, "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "deposit" => {
            let amount = args["amount"].as_str().ok_or("amount required")?;
            let chain = args["chain"].as_str().ok_or("chain required")?;
            let out = run_zeta(&[
                "deposit", "--amount", amount, "--chain", chain, "--output", "json",
            ])?;
            Ok(json!({"output": out.trim()}))
        }
        "withdraw" => {
            let amount = args["amount"].as_str().ok_or("amount required")?;
            let chain = args["chain"].as_str().ok_or("chain required")?;
            let out = run_zeta(&[
                "withdraw", "--amount", amount, "--chain", chain, "--output", "json",
            ])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_tss_address" => {
            let out = run_zeta(&["tss", "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_observers" => {
            let out = run_zeta(&["observers", "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        "get_node_info" => {
            let out = run_zeta(&["node-info", "--output", "json"])?;
            Ok(json!({"output": out.trim()}))
        }
        _ => Err(format!("Unknown tool: {name}")),
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .with_writer(std::io::stderr)
        .init();
    info!("universal-blockchain-mcp starting on stdio");
    let stdin = std::io::stdin();
    let stdout = std::io::stdout();
    let mut line = String::new();
    loop {
        line.clear();
        if stdin.lock().read_line(&mut line).unwrap_or(0) == 0 {
            break;
        }
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        let req: JsonRpcRequest = match serde_json::from_str(trimmed) {
            Ok(r) => r,
            Err(_) => continue,
        };
        let response = match req.method.as_str() {
            "initialize" => {
                json!({"jsonrpc":"2.0","id":req.id,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"universal-blockchain-mcp","version":"0.1.0"}}})
            }
            "notifications/initialized" => continue,
            "tools/list" => {
                json!({"jsonrpc":"2.0","id":req.id,"result":{"tools":tool_definitions()}})
            }
            "tools/call" => {
                let tn = req.params["name"].as_str().unwrap_or("");
                let a = &req.params["arguments"];
                match call_tool(tn, a) {
                    Ok(r) => {
                        json!({"jsonrpc":"2.0","id":req.id,"result":{"content":[{"type":"text","text":serde_json::to_string_pretty(&r).unwrap_or_default()}]}})
                    }
                    Err(e) => {
                        json!({"jsonrpc":"2.0","id":req.id,"result":{"content":[{"type":"text","text":format!("Error: {e}")}],"isError":true}})
                    }
                }
            }
            _ => {
                json!({"jsonrpc":"2.0","id":req.id,"error":{"code":-32601,"message":format!("Unknown method: {}",req.method)}})
            }
        };
        use std::io::Write;
        let out = serde_json::to_string(&response).unwrap();
        let mut lock = stdout.lock();
        let _ = writeln!(lock, "{out}");
        let _ = lock.flush();
    }
}
