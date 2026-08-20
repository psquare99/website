# Project Page System

Project pages now consume the same block-based page body model used by Journal.

Supported blocks: paragraph, heading, image, and quote.

For backwards compatibility, projects with an empty `blocks` array continue to
use the existing structured ProjectBody renderer. Once a project has blocks,
the block-based page body becomes its primary content area while the existing
project sidebar/facts remain available.
