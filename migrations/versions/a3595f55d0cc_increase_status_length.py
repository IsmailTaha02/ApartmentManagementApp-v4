"""Increase status length

Revision ID: a3595f55d0cc
Revises: b41d3e098e9d
Create Date: 2025-06-28 17:33:00.016938

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'a3595f55d0cc'
down_revision = 'b41d3e098e9d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('maintenance_pricing', schema=None) as batch_op:
        batch_op.drop_index('problem_type')

    op.drop_table('maintenance_pricing')
    with op.batch_alter_table('apartments', schema=None) as batch_op:
        batch_op.alter_column('owner_id',
               existing_type=mysql.BIGINT(),
               nullable=False)
        batch_op.alter_column('video',
               existing_type=mysql.TEXT(),
               type_=sa.String(length=500),
               existing_nullable=True)
        batch_op.alter_column('map_location',
               existing_type=mysql.TEXT(),
               type_=sa.String(length=500),
               existing_nullable=True)
        batch_op.alter_column('created_at',
               existing_type=mysql.TIMESTAMP(),
               type_=sa.DateTime(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
        batch_op.drop_constraint('apartments_ibfk_1', type_='foreignkey')
        batch_op.create_foreign_key(None, 'users', ['owner_id'], ['id'])

    with op.batch_alter_table('maintenance_requests', schema=None) as batch_op:
        batch_op.alter_column('user_id',
               existing_type=mysql.BIGINT(),
               nullable=False)
        batch_op.alter_column('problem_type',
               existing_type=mysql.VARCHAR(length=255),
               nullable=True)
        batch_op.alter_column('status',
               existing_type=mysql.VARCHAR(length=30),
               type_=sa.Enum('Pending', 'Pending Confirmation', 'Approved', 'In Progress', 'Resolved', 'Cancelled', 'Rejected', name='request_status'),
               nullable=False)
        batch_op.alter_column('request_date',
               existing_type=mysql.TIMESTAMP(),
               type_=sa.DateTime(),
               nullable=False,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
        batch_op.drop_constraint('maintenance_requests_ibfk_1', type_='foreignkey')
        batch_op.drop_constraint('maintenance_requests_ibfk_2', type_='foreignkey')
        batch_op.drop_constraint('maintenance_requests_ibfk_3', type_='foreignkey')
        batch_op.create_foreign_key(None, 'apartments', ['apartment_id'], ['id'])
        batch_op.create_foreign_key(None, 'users', ['user_id'], ['id'])
        batch_op.create_foreign_key(None, 'users', ['technician_id'], ['id'])
        batch_op.drop_column('technician_response')

    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.alter_column('amount',
               existing_type=mysql.DECIMAL(precision=12, scale=2),
               nullable=True)
        batch_op.alter_column('due_date',
               existing_type=mysql.TIMESTAMP(),
               type_=sa.DateTime(),
               nullable=True)
        batch_op.alter_column('paid_date',
               existing_type=mysql.TIMESTAMP(),
               type_=sa.DateTime(),
               existing_nullable=True)
        batch_op.alter_column('status',
               existing_type=mysql.ENUM('Pending', 'Completed', 'Overdue'),
               nullable=True)
        batch_op.drop_constraint('payments_ibfk_1', type_='foreignkey')

    with op.batch_alter_table('transactions', schema=None) as batch_op:
        batch_op.alter_column('status',
               existing_type=mysql.ENUM('Pending', 'Completed', 'Overdue'),
               nullable=True)
        batch_op.alter_column('created_at',
               existing_type=mysql.TIMESTAMP(),
               type_=sa.DateTime(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
        batch_op.drop_constraint('transactions_ibfk_1', type_='foreignkey')
        batch_op.drop_constraint('transactions_ibfk_2', type_='foreignkey')
        batch_op.create_foreign_key(None, 'users', ['user_id'], ['id'])
        batch_op.create_foreign_key(None, 'apartments', ['apartment_id'], ['id'])

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('full_name',
               existing_type=mysql.VARCHAR(length=255),
               type_=sa.Text(),
               existing_nullable=False)
        batch_op.alter_column('phone_number',
               existing_type=mysql.VARCHAR(length=20),
               type_=sa.Text(),
               existing_nullable=False)
        batch_op.alter_column('role',
               existing_type=mysql.ENUM('Owner', 'Administrator', 'Buyer/Tenant', 'Technician'),
               type_=sa.Enum('Administrator', 'Buyer/Tenant', 'Owner', 'Technician'),
               existing_nullable=False)
        batch_op.alter_column('job',
               existing_type=mysql.VARCHAR(length=255),
               type_=sa.Text(),
               existing_nullable=True)
        batch_op.alter_column('facebook_link',
               existing_type=mysql.VARCHAR(length=255),
               type_=sa.Text(),
               existing_nullable=True)
        batch_op.alter_column('password',
               existing_type=mysql.VARCHAR(length=255),
               type_=sa.Text(),
               existing_nullable=False)
        batch_op.alter_column('created_at',
               existing_type=mysql.TIMESTAMP(),
               type_=sa.DateTime(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('created_at',
               existing_type=sa.DateTime(),
               type_=mysql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
        batch_op.alter_column('password',
               existing_type=sa.Text(),
               type_=mysql.VARCHAR(length=255),
               existing_nullable=False)
        batch_op.alter_column('facebook_link',
               existing_type=sa.Text(),
               type_=mysql.VARCHAR(length=255),
               existing_nullable=True)
        batch_op.alter_column('job',
               existing_type=sa.Text(),
               type_=mysql.VARCHAR(length=255),
               existing_nullable=True)
        batch_op.alter_column('role',
               existing_type=sa.Enum('Administrator', 'Buyer/Tenant', 'Owner', 'Technician'),
               type_=mysql.ENUM('Owner', 'Administrator', 'Buyer/Tenant', 'Technician'),
               existing_nullable=False)
        batch_op.alter_column('phone_number',
               existing_type=sa.Text(),
               type_=mysql.VARCHAR(length=20),
               existing_nullable=False)
        batch_op.alter_column('full_name',
               existing_type=sa.Text(),
               type_=mysql.VARCHAR(length=255),
               existing_nullable=False)

    with op.batch_alter_table('transactions', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('transactions_ibfk_2', 'users', ['user_id'], ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key('transactions_ibfk_1', 'apartments', ['apartment_id'], ['id'], ondelete='CASCADE')
        batch_op.alter_column('created_at',
               existing_type=sa.DateTime(),
               type_=mysql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
        batch_op.alter_column('status',
               existing_type=mysql.ENUM('Pending', 'Completed', 'Overdue'),
               nullable=False)

    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.create_foreign_key('payments_ibfk_1', 'transactions', ['transaction_id'], ['id'], ondelete='CASCADE')
        batch_op.alter_column('status',
               existing_type=mysql.ENUM('Pending', 'Completed', 'Overdue'),
               nullable=False)
        batch_op.alter_column('paid_date',
               existing_type=sa.DateTime(),
               type_=mysql.TIMESTAMP(),
               existing_nullable=True)
        batch_op.alter_column('due_date',
               existing_type=sa.DateTime(),
               type_=mysql.TIMESTAMP(),
               nullable=False)
        batch_op.alter_column('amount',
               existing_type=mysql.DECIMAL(precision=12, scale=2),
               nullable=False)

    with op.batch_alter_table('maintenance_requests', schema=None) as batch_op:
        batch_op.add_column(sa.Column('technician_response', mysql.ENUM('Pending', 'Accepted', 'Rejected'), server_default=sa.text("'Pending'"), nullable=True))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('maintenance_requests_ibfk_3', 'users', ['technician_id'], ['id'], ondelete='SET NULL')
        batch_op.create_foreign_key('maintenance_requests_ibfk_2', 'users', ['user_id'], ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key('maintenance_requests_ibfk_1', 'apartments', ['apartment_id'], ['id'], ondelete='CASCADE')
        batch_op.alter_column('request_date',
               existing_type=sa.DateTime(),
               type_=mysql.TIMESTAMP(),
               nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
        batch_op.alter_column('status',
               existing_type=sa.Enum('Pending', 'Pending Confirmation', 'Approved', 'In Progress', 'Resolved', 'Cancelled', 'Rejected', name='request_status'),
               type_=mysql.VARCHAR(length=30),
               nullable=True)
        batch_op.alter_column('problem_type',
               existing_type=mysql.VARCHAR(length=255),
               nullable=False)
        batch_op.alter_column('user_id',
               existing_type=mysql.BIGINT(),
               nullable=True)

    with op.batch_alter_table('apartments', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('apartments_ibfk_1', 'users', ['owner_id'], ['id'], ondelete='SET NULL')
        batch_op.alter_column('created_at',
               existing_type=sa.DateTime(),
               type_=mysql.TIMESTAMP(),
               existing_nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
        batch_op.alter_column('map_location',
               existing_type=sa.String(length=500),
               type_=mysql.TEXT(),
               existing_nullable=True)
        batch_op.alter_column('video',
               existing_type=sa.String(length=500),
               type_=mysql.TEXT(),
               existing_nullable=True)
        batch_op.alter_column('owner_id',
               existing_type=mysql.BIGINT(),
               nullable=True)

    op.create_table('maintenance_pricing',
    sa.Column('id', mysql.BIGINT(), autoincrement=True, nullable=False),
    sa.Column('problem_type', mysql.VARCHAR(length=255), nullable=False),
    sa.Column('base_cost', mysql.DECIMAL(precision=10, scale=2), nullable=False),
    sa.Column('cost_per_hour', mysql.DECIMAL(precision=10, scale=2), nullable=False),
    sa.Column('estimated_duration_hours', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    with op.batch_alter_table('maintenance_pricing', schema=None) as batch_op:
        batch_op.create_index('problem_type', ['problem_type'], unique=True)

    # ### end Alembic commands ###
