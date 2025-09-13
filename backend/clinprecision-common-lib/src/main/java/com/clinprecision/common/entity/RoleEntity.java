package com.clinprecision.common.entity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="roles")
public class RoleEntity implements Serializable {

    private static final long serialVersionUID = 6929482536229723029L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    @Column(nullable=false, length=200)
    private String name;
    
    @ManyToMany(mappedBy="roles")
    private Collection<UserEntity> users = new ArrayList<>();
    
    @ManyToMany(cascade=CascadeType.PERSIST, fetch=FetchType.EAGER)
    @JoinTable(name="roles_authorities", joinColumns=@JoinColumn(name="roles_id", referencedColumnName="id"), 
            inverseJoinColumns=@JoinColumn(name="authorities_id", referencedColumnName="id"))
    private Collection<AuthorityEntity> authorities = new ArrayList<>();
    
    public RoleEntity() {
        
    }

    public RoleEntity(String name, Collection<AuthorityEntity> authorities) {
        this.name = name;
        this.authorities = new ArrayList<>(authorities);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Collection<UserEntity> getUsers() {
        return users;
    }

    public void setUsers(Collection<UserEntity> users) {
        this.users = users;
    }

    public Collection<AuthorityEntity> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Collection<AuthorityEntity> authorities) {
        this.authorities.clear();
        if (authorities != null) {
            this.authorities.addAll(authorities);
        }
    }
}