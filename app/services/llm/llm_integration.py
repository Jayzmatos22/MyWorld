import os
import time
from dataclasses import dataclass

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from openai import APIStatusError, OpenAI
from pydantic import BaseModel, Field