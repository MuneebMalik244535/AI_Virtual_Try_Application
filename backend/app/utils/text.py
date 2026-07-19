"""
Text-processing utilities shared across agents and routes.

Contains pure functions for parsing LLM output and formatting product data
for prompt injection. No I/O or external dependencies.
"""

import re
from typing import List, Dict, Any


def format_products_for_prompt(products: List[Dict[str, Any]]) -> str:
    """
    Format a product catalog list into a compact prompt-friendly string.

    Args:
        products: List of product dicts containing at least id, name, price,
                  category, description, color, style_tags.

    Returns:
        A newline-delimited string of product summaries.
    """
    product_list = []
    for product in products:
        product_info = (
            f"ID: {product['id']}\n"
            f"Name: {product['name']}\n"
            f"Price: ${product['price']:.2f}\n"
            f"Category: {product['category']}\n"
            f"Description: {product.get('description', '')}\n"
            f"Color: {product.get('color', '')}\n"
            f"Style: {product.get('style_tags', '')}\n"
        )
        product_list.append(product_info)
    return "\n".join(product_list)


def parse_recommendations_text(text: str) -> List[Dict[str, Any]]:
    """
    Parse the numbered product list returned by the recommendation LLM.

    Handles:
    - <think>...</think> blocks produced by models like Qwen.
    - Markdown bold/italic markers.
    - Numbered items (``1.``, ``2.`` …) with inline or separate field lines.

    Args:
        text: Raw LLM response string.

    Returns:
        List of dicts with keys: name, price, reason (and optionally number).
    """
    recommendations: List[Dict[str, Any]] = []

    try:
        # Strip <think> reasoning blocks
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)

        lines = text.strip().split("\n")
        current_rec: Dict[str, Any] = {}

        for line in lines:
            line = line.strip()

            # Remove Markdown bold/italics
            line_clean = line.replace("**", "").replace("*", "").strip()

            if not line_clean:
                continue

            # Numbered item → start a new recommendation block
            if re.match(r"^\d+\.", line_clean):
                if current_rec:
                    recommendations.append(current_rec)

                number_part = line_clean.split(".", 1)[0]
                rest_of_line = line_clean.split(".", 1)[1].strip()
                current_rec = {"number": number_part}

                if "Product Name:" in rest_of_line:
                    current_rec["name"] = rest_of_line.split("Product Name:", 1)[1].strip()
                elif rest_of_line:
                    current_rec["name"] = rest_of_line.strip()

            elif line_clean.startswith("Product Name:"):
                current_rec["name"] = line_clean.split("Product Name:", 1)[1].strip()

            elif line_clean.startswith("Price:"):
                price_text = line_clean.split("Price:", 1)[1].strip()
                try:
                    current_rec["price"] = float(price_text.replace("$", "").replace(",", ""))
                except ValueError:
                    current_rec["price"] = price_text

            elif line_clean.startswith("Reason:"):
                current_rec["reason"] = line_clean.split("Reason:", 1)[1].strip()

        if current_rec:
            recommendations.append(current_rec)

    except Exception:
        pass

    return recommendations


def strip_markdown_fences(text: str) -> str:
    """
    Remove triple-backtick code fences (including ```json) from LLM output.

    Args:
        text: Raw LLM string possibly containing markdown code fences.

    Returns:
        Cleaned string.
    """
    return text.replace("```json", "").replace("```", "").strip()


def catalog_to_compact_text(products: List[Dict[str, Any]]) -> str:
    """
    Format a product list into a single-line-per-product compact catalog string
    used inside chat and outfit completion prompts.

    Args:
        products: List of product dicts.

    Returns:
        Newline-delimited string, one product per line.
    """
    return "\n".join(
        f"- [{p['name']}] | ${p['price']} | {p['category']} | {p['color']} | Brand: {p.get('brand', 'N/A')}"
        for p in products
    )
