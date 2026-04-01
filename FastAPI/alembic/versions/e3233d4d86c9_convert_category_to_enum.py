"""convert_category_to_enum

Revision ID: e3233d4d86c9
Revises: 947ee2f743f5
Create Date: 2026-03-31 22:56:48.259544

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3233d4d86c9'
down_revision: Union[str, Sequence[str], None] = '947ee2f743f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
  # 1. Create the Enum type in the database first
  # 'transactioncategory' is the name the DB will use
  transaction_category_enum = sa.Enum(
    'housing', 'utilities', 'food', 'transportation',
    'entertainment', 'shopping', 'personal_care', 'health',
    'travel', 'subscriptions', 'education', 'financial',
    'income', 'other', name='transactioncategory'
  )
  transaction_category_enum.create(op.get_bind())

  # 2. Update existing data to 'other' so the conversion doesn't fail
  op.execute("UPDATE transactions SET category = 'other'")

  # 3. Alter the column to use the new Enum type
  # If using Postgres, we specify the 'postgresql_using' to cast the type
  op.alter_column('transactions', 'category',
                  existing_type=sa.String(),
                  type_=transaction_category_enum,
                  existing_nullable=True,
                  nullable=False,
                  postgresql_using="category::transactioncategory")

def downgrade():
  # Convert back to string and drop the Enum type
  op.alter_column('transactions', 'category',
                  existing_type=sa.Enum(name='transactioncategory'),
                  type=sa.String(),
                  existing_nullable=False,
                  nullable=True)

  sa.Enum(name='transactioncategory').drop(op.get_bind())
