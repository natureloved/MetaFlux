import httpx
import os
from typing import Optional


class OpenMetadataClient:
    """Thin wrapper around the OpenMetadata REST API."""

    INDEX_MAP = {
        "table": "table_search_index",
        "dashboard": "dashboard_search_index",
        "pipeline": "pipeline_search_index",
        "topic": "topic_search_index",
        "mlmodel": "mlmodel_search_index",
        "glossary_term": "glossary_term_search_index",
        "tag": "tag_search_index",
        "all": "all",
    }

    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )

    def search(self, query: str, entity_type: str = "table", size: int = 10) -> dict:
        index = self.INDEX_MAP.get(entity_type, "table_search_index")
        response = self._client.get(
            f"{self.base_url}/api/v1/search/query",
            params={"q": query, "index": index, "from": 0, "size": size},
        )
        response.raise_for_status()
        return response.json()

    def get_table(self, fqn: str) -> dict:
        response = self._client.get(
            f"{self.base_url}/api/v1/tables/name/{fqn}",
            params={
                "fields": "columns,owners,tags,followers,dataModel,usageSummary"
            },
        )
        response.raise_for_status()
        return response.json()

    def get_lineage(
        self,
        entity_type: str,
        fqn: str,
        upstream_depth: int = 2,
        downstream_depth: int = 2,
    ) -> dict:
        response = self._client.get(
            f"{self.base_url}/api/v1/lineage/{entity_type}/name/{fqn}",
            params={
                "upstreamDepth": upstream_depth,
                "downstreamDepth": downstream_depth,
            },
        )
        response.raise_for_status()
        return response.json()

    def get_data_quality(self, table_fqn: str, limit: int = 25) -> dict:
        entity_link = f"<#E::table::{table_fqn}>"
        response = self._client.get(
            f"{self.base_url}/api/v1/dataQuality/testCases",
            params={
                "entityLink": entity_link,
                "limit": limit,
                "fields": "testDefinition,testSuite,testCaseResult",
            },
        )
        response.raise_for_status()
        return response.json()

    def list_tables(self, database_schema: Optional[str] = None, limit: int = 20) -> dict:
        params = {"limit": limit, "fields": "owners,tags,usageSummary"}
        if database_schema:
            params["databaseSchema"] = database_schema
        response = self._client.get(
            f"{self.base_url}/api/v1/tables", params=params
        )
        response.raise_for_status()
        return response.json()

    def get_glossary_terms(self, query: str = "", limit: int = 20) -> dict:
        params = {"limit": limit, "fields": "owners,tags,relatedTerms"}
        response = self._client.get(
            f"{self.base_url}/api/v1/glossaryTerms", params=params
        )
        response.raise_for_status()
        return response.json()

    def get_tags(self) -> dict:
        response = self._client.get(
            f"{self.base_url}/api/v1/classifications",
            params={"limit": 50},
        )
        response.raise_for_status()
        return response.json()

    def get_user(self, name: str) -> dict:
        response = self._client.get(
            f"{self.base_url}/api/v1/users/name/{name}",
            params={"fields": "roles,teams,owns"},
        )
        response.raise_for_status()
        return response.json()

    def patch_table(self, table_id: str, patch_data: list) -> dict:
        """Apply a JSON Patch to a table."""
        response = self._client.patch(
            f"{self.base_url}/api/v1/tables/{table_id}",
            json=patch_data,
            headers={"Content-Type": "application/json-patch+json"},
        )
        response.raise_for_status()
        return response.json()
