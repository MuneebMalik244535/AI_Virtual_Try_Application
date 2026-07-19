"""
User profiling module
Contains agents for user preference collection and profiling
"""

from .fashion_profiler import FashionProfiler
from .fashion_collector import FashionPreferenceCollector
from .profile_builder import build_style_profile

__all__ = ['FashionProfiler', 'FashionPreferenceCollector', 'build_style_profile']
